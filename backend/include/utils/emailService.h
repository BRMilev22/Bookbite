#ifndef EMAIL_SERVICE_H
#define EMAIL_SERVICE_H

#include <string>
#include <vector>
#include <map>

class EmailService {
public:
    EmailService();
    
    bool sendEmailVerification(
        const std::string& toEmail,
        const std::string& username,
        const std::string& verificationToken
    );
    
    bool sendReservationConfirmation(
        const std::string& toEmail,
        const std::string& customerName,
        const std::string& restaurantName,
        const std::string& date,
        const std::string& time,
        int guestCount,
        const std::string& confirmationToken,
        int reservationId
    );
    
    bool sendReservationConfirmed(
        const std::string& toEmail,
        const std::string& customerName,
        const std::string& restaurantName,
        const std::string& date,
        const std::string& time,
        int guestCount,
        int reservationId
    );
    
    std::string generateConfirmationToken();
    
private:
    std::string smtpHost;
    int smtpPort;
    std::string smtpUser;
    std::string smtpPassword;
    std::string fromEmail;
    
    bool sendEmail(
        const std::string& toEmail,
        const std::string& subject,
        const std::string& htmlBody,
        const std::string& textBody = ""
    );
    
    std::string getConfirmationEmailTemplate(
        const std::string& customerName,
        const std::string& restaurantName,
        const std::string& date,
        const std::string& time,
        int guestCount,
        const std::string& confirmationUrl
    );
    
    std::string getConfirmedEmailTemplate(
        const std::string& customerName,
        const std::string& restaurantName,
        const std::string& date,
        const std::string& time,
        int guestCount,
        int reservationId
    );
};

#endif // EMAIL_SERVICE_H
