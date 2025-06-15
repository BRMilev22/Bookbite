#include "models/payment.h"

Payment::Payment() : id(0), reservationId(0), userId(0), amount(0.0) {}

Payment::Payment(int id, int reservationId, int userId, double amount, 
                const std::string& paymentMethod, const std::string& paymentStatus)
    : id(id), reservationId(reservationId), userId(userId), amount(amount),
      paymentMethod(paymentMethod), paymentStatus(paymentStatus) {}

int Payment::getId() const {
    return id;
}

int Payment::getReservationId() const {
    return reservationId;
}

int Payment::getUserId() const {
    return userId;
}

double Payment::getAmount() const {
    return amount;
}

std::string Payment::getPaymentMethod() const {
    return paymentMethod;
}

std::string Payment::getPaymentStatus() const {
    return paymentStatus;
}

std::string Payment::getTransactionId() const {
    return transactionId;
}

std::string Payment::getCardLastFour() const {
    return cardLastFour;
}

std::string Payment::getCardType() const {
    return cardType;
}

std::string Payment::getCardholderName() const {
    return cardholderName;
}

std::string Payment::getBillingAddress() const {
    return billingAddress;
}

std::string Payment::getCreatedAt() const {
    return createdAt;
}

std::string Payment::getUpdatedAt() const {
    return updatedAt;
}

void Payment::setId(int id) {
    this->id = id;
}

void Payment::setReservationId(int reservationId) {
    this->reservationId = reservationId;
}

void Payment::setUserId(int userId) {
    this->userId = userId;
}

void Payment::setAmount(double amount) {
    this->amount = amount;
}

void Payment::setPaymentMethod(const std::string& paymentMethod) {
    this->paymentMethod = paymentMethod;
}

void Payment::setPaymentStatus(const std::string& paymentStatus) {
    this->paymentStatus = paymentStatus;
}

void Payment::setTransactionId(const std::string& transactionId) {
    this->transactionId = transactionId;
}

void Payment::setCardLastFour(const std::string& cardLastFour) {
    this->cardLastFour = cardLastFour;
}

void Payment::setCardType(const std::string& cardType) {
    this->cardType = cardType;
}

void Payment::setCardholderName(const std::string& cardholderName) {
    this->cardholderName = cardholderName;
}

void Payment::setBillingAddress(const std::string& billingAddress) {
    this->billingAddress = billingAddress;
}

void Payment::setCreatedAt(const std::string& createdAt) {
    this->createdAt = createdAt;
}

void Payment::setUpdatedAt(const std::string& updatedAt) {
    this->updatedAt = updatedAt;
}