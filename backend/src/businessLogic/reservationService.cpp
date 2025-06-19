#include "businessLogic/reservationService.h"
#include <iostream>

ReservationService::ReservationService() {}

std::vector<Reservation> ReservationService::getAllReservations() {
    return reservationData.getAllReservations();
}

std::vector<Reservation> ReservationService::getReservationsByUserId(int userId) {
    return reservationData.getReservationsByUserId(userId);
}

std::vector<Reservation> ReservationService::getReservationsByRestaurantId(int restaurantId) {
    return reservationData.getReservationsByRestaurantId(restaurantId);
}

std::optional<Reservation> ReservationService::getReservationById(int id) {
    return reservationData.getReservationById(id);
}

bool ReservationService::createReservation(const Reservation& reservation) {
    auto table = tableData.getTableById(reservation.getTableId());
    if (!table) {
        return false;
    }

    if (!reservationData.isTableAvailable(reservation.getTableId(),
                                          reservation.getDate(),
                                          reservation.getStartTime(),
                                          reservation.getEndTime())) {
        return false;
    }

    Reservation pendingReservation = reservation;
    pendingReservation.setStatus("pending");
    
    std::string confirmationToken = emailService.generateConfirmationToken();
    pendingReservation.setConfirmationToken(confirmationToken);

    bool success = reservationData.addReservation(pendingReservation);
    
    if (success) {
        auto createdReservation = reservationData.getReservationByConfirmationToken(confirmationToken);
        if (createdReservation) {
            auto user = userData.getUserById(reservation.getUserId());
            auto restaurant = restaurantData.getRestaurantById(reservation.getRestaurantId());
            
            if (user && restaurant) {
                std::string customerName = user->getFirstName() + " " + user->getLastName();
                if (customerName.empty() || customerName == " ") {
                    customerName = user->getUsername();
                }
                
                std::string timeSlot = reservation.getStartTime() + " - " + reservation.getEndTime();
                
                emailService.sendReservationConfirmation(
                    reservation.getEmail().empty() ? user->getEmail() : reservation.getEmail(),
                    customerName,
                    restaurant->getName(),
                    reservation.getDate(),
                    timeSlot,
                    reservation.getGuestCount(),
                    confirmationToken,
                    createdReservation->getId()
                );
                
                std::cout << "Reservation created with ID: " << createdReservation->getId() 
                         << ", confirmation email sent to: " << (reservation.getEmail().empty() ? user->getEmail() : reservation.getEmail()) << std::endl;
            }
        }
    }
    
    return success;
}

bool ReservationService::updateReservation(const Reservation& reservation) {
    auto existingReservation = reservationData.getReservationById(reservation.getId());
    if (!existingReservation) {
        return false;
    }

    auto table = tableData.getTableById(reservation.getTableId());
    if (!table) {
        return false;
    }

    if (!reservationData.isTableAvailable(reservation.getTableId(),
                                          reservation.getDate(),
                                          reservation.getStartTime(),
                                          reservation.getEndTime(),
                                          reservation.getId())) {
        return false;
    }

    return reservationData.updateReservation(reservation);
}

bool ReservationService::cancelReservation(int id) {
    auto reservation = reservationData.getReservationById(id);
    if (!reservation) {
        return false;
    }

    return reservationData.updateReservationStatus(id, "cancelled");
}

bool ReservationService::completeReservation(int id) {
    // Get the reservation
    auto reservation = reservationData.getReservationById(id);
    if (!reservation) {
        return false; // Reservation not found
    }

    // Update the reservation status
    return reservationData.updateReservationStatus(id, "completed");
}

void ReservationService::updateTableAvailability(int tableId, bool isAvailable) {
    tableData.updateTableAvailability(tableId, isAvailable);
}

bool ReservationService::confirmReservation(const std::string& token) {
    // Get the reservation by token
    auto reservation = reservationData.getReservationByConfirmationToken(token);
    if (!reservation) {
        std::cerr << "Reservation not found for token: " << token << std::endl;
        return false;
    }
    
    // Check if reservation is still pending
    if (reservation->getStatus() != "pending") {
        std::cerr << "Reservation is not pending, current status: " << reservation->getStatus() << std::endl;
        return false;
    }
    
    // Confirm the reservation
    bool success = reservationData.confirmReservation(token);
    
    if (success) {
        // Get user and restaurant information for the confirmation email
        auto user = userData.getUserById(reservation->getUserId());
        auto restaurant = restaurantData.getRestaurantById(reservation->getRestaurantId());
        
        if (user && restaurant) {
            std::string customerName = user->getFirstName() + " " + user->getLastName();
            if (customerName.empty() || customerName == " ") {
                customerName = user->getUsername();
            }
            
            std::string timeSlot = reservation->getStartTime() + " - " + reservation->getEndTime();
            
            // Send confirmation email
            emailService.sendReservationConfirmed(
                reservation->getEmail().empty() ? user->getEmail() : reservation->getEmail(),
                customerName,
                restaurant->getName(),
                reservation->getDate(),
                timeSlot,
                reservation->getGuestCount(),
                reservation->getId()
            );
            
            std::cout << "Reservation confirmed: ID " << reservation->getId() 
                     << ", confirmation email sent to: " << (reservation->getEmail().empty() ? user->getEmail() : reservation->getEmail()) << std::endl;
        }
    }
    
    return success;
}

bool ReservationService::resendConfirmationEmail(int reservationId) {
    // Get the reservation by ID
    auto reservation = reservationData.getReservationById(reservationId);
    if (!reservation) {
        std::cerr << "Reservation not found for ID: " << reservationId << std::endl;
        return false;
    }
    
    // Check if reservation is still pending
    if (reservation->getStatus() != "pending") {
        std::cerr << "Cannot resend confirmation email - reservation is not pending, current status: " << reservation->getStatus() << std::endl;
        return false;
    }
    
    // Check if reservation has a confirmation token
    if (reservation->getConfirmationToken().empty()) {
        std::cerr << "Cannot resend confirmation email - no confirmation token found" << std::endl;
        return false;
    }
    
    // Get user and restaurant information for the email
    auto user = userData.getUserById(reservation->getUserId());
    auto restaurant = restaurantData.getRestaurantById(reservation->getRestaurantId());
    
    if (!user || !restaurant) {
        std::cerr << "Cannot resend confirmation email - user or restaurant not found" << std::endl;
        return false;
    }
    
    std::string customerName = user->getFirstName() + " " + user->getLastName();
    if (customerName.empty() || customerName == " ") {
        customerName = user->getUsername();
    }
    
    std::string timeSlot = reservation->getStartTime() + " - " + reservation->getEndTime();
    
    // Send confirmation email
    bool emailSent = emailService.sendReservationConfirmation(
        reservation->getEmail().empty() ? user->getEmail() : reservation->getEmail(),
        customerName,
        restaurant->getName(),
        reservation->getDate(),
        timeSlot,
        reservation->getGuestCount(),
        reservation->getConfirmationToken(),
        reservation->getId()
    );
    
    if (emailSent) {
        std::cout << "Confirmation email resent for reservation ID: " << reservation->getId() 
                 << ", sent to: " << (reservation->getEmail().empty() ? user->getEmail() : reservation->getEmail()) << std::endl;
    } else {
        std::cerr << "Failed to resend confirmation email for reservation ID: " << reservation->getId() << std::endl;
    }
    
    return emailSent;
}
