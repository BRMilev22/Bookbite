#include "utils/emailService.h"
#include "utils/envLoader.h"
#include <iostream>
#include <random>
#include <sstream>
#include <iomanip>
#include <curl/curl.h>
#include <ctime>
#include <cstring>
#include <cstdlib>

EmailService::EmailService() {
    // Initialize SMTP configuration
    smtpHost = std::getenv("SMTP_HOST") ? std::getenv("SMTP_HOST") : "smtp.gmail.com";
    smtpPort = std::getenv("SMTP_PORT") ? std::stoi(std::getenv("SMTP_PORT")) : 587;
    smtpUser = std::getenv("SMTP_USER") ? std::getenv("SMTP_USER") : "";
    smtpPassword = std::getenv("SMTP_PASSWORD") ? std::getenv("SMTP_PASSWORD") : "";
    fromEmail = std::getenv("FROM_EMAIL") ? std::getenv("FROM_EMAIL") : "noreply@bookbite.com";
    
    // If no environment variables set, fall back to console logging
    if (smtpUser.empty() || smtpPassword.empty()) {
        std::cout << "📧 Email service running in console mode (no SMTP credentials)" << std::endl;
    } else {
        std::cout << "📧 Email service configured with SMTP: " << smtpHost << ":" << smtpPort << std::endl;
    }
}

std::string EmailService::generateConfirmationToken() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 15);
    
    std::stringstream ss;
    for (int i = 0; i < 32; ++i) {
        ss << std::hex << dis(gen);
    }
    
    return ss.str();
}

bool EmailService::sendReservationConfirmation(
    const std::string& toEmail,
    const std::string& customerName,
    const std::string& restaurantName,
    const std::string& date,
    const std::string& time,
    int guestCount,
    const std::string& confirmationToken,
    int reservationId
) {
    std::string confirmationUrl = "http://localhost:3000/confirm-reservation?token=" + confirmationToken;
    
    std::string subject = "Please confirm your reservation at " + restaurantName;
    std::string htmlBody = getConfirmationEmailTemplate(
        customerName, restaurantName, date, time, guestCount, confirmationUrl
    );
    
    return sendEmail(toEmail, subject, htmlBody);
}

bool EmailService::sendReservationConfirmed(
    const std::string& toEmail,
    const std::string& customerName,
    const std::string& restaurantName,
    const std::string& date,
    const std::string& time,
    int guestCount,
    int reservationId
) {
    std::string subject = "Reservation Confirmed - " + restaurantName;
    std::string htmlBody = getConfirmedEmailTemplate(
        customerName, restaurantName, date, time, guestCount, reservationId
    );
    
    return sendEmail(toEmail, subject, htmlBody);
}

bool EmailService::sendEmail(
    const std::string& toEmail,
    const std::string& subject,
    const std::string& htmlBody,
    const std::string& textBody
) {
    // If no SMTP credentials, just log to console (development mode)
    if (smtpUser.empty() || smtpPassword.empty()) {
        std::cout << "=== EMAIL SENT (CONSOLE MODE) ===" << std::endl;
        std::cout << "To: " << toEmail << std::endl;
        std::cout << "Subject: " << subject << std::endl;
        std::cout << "Body: " << std::endl << std::endl;
        std::cout << htmlBody << std::endl;
        std::cout << "=================" << std::endl;
        return true;
    }
    
    // Send actual email using CURL SMTP
    CURL *curl;
    CURLcode res = CURLE_OK;
    
    curl = curl_easy_init();
    if (curl) {
        // Set SMTP server - use smtp:// for STARTTLS on port 587
        std::string smtpUrl = "smtp://" + smtpHost + ":" + std::to_string(smtpPort);
        curl_easy_setopt(curl, CURLOPT_URL, smtpUrl.c_str());
        
        // Set authentication
        curl_easy_setopt(curl, CURLOPT_USE_SSL, CURLUSESSL_TRY);
        curl_easy_setopt(curl, CURLOPT_USERNAME, smtpUser.c_str());
        curl_easy_setopt(curl, CURLOPT_PASSWORD, smtpPassword.c_str());
        
        // Gmail SMTP specific settings
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 1L);
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 2L);
        
        // Set recipients
        struct curl_slist *recipients = nullptr;
        recipients = curl_slist_append(recipients, toEmail.c_str());
        curl_easy_setopt(curl, CURLOPT_MAIL_RCPT, recipients);
        
        // Set sender
        curl_easy_setopt(curl, CURLOPT_MAIL_FROM, fromEmail.c_str());
        
        // Email content
        std::string emailContent = "To: " + toEmail + "\r\n";
        emailContent += "From: " + fromEmail + "\r\n";
        emailContent += "Subject: " + subject + "\r\n";
        emailContent += "Content-Type: text/html; charset=UTF-8\r\n";
        emailContent += "\r\n";
        emailContent += htmlBody;
        
        // Set up data callback
        struct EmailData {
            std::string content;
            size_t pos = 0;
        };
        
        EmailData emailData;
        emailData.content = emailContent;
        
        curl_easy_setopt(curl, CURLOPT_READDATA, &emailData);
        curl_easy_setopt(curl, CURLOPT_READFUNCTION, +[](char *ptr, size_t size, size_t nmemb, void *userdata) -> size_t {
            EmailData* data = static_cast<EmailData*>(userdata);
            size_t room = size * nmemb;
            size_t len = data->content.length() - data->pos;
            
            if (len > room) len = room;
            if (len > 0) {
                memcpy(ptr, data->content.c_str() + data->pos, len);
                data->pos += len;
            }
            return len;
        });
        
        curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);
        
        // Send the email
        res = curl_easy_perform(curl);
        
        // Cleanup
        curl_slist_free_all(recipients);
        curl_easy_cleanup(curl);
        
        if (res != CURLE_OK) {
            std::cerr << "Failed to send email: " << curl_easy_strerror(res) << std::endl;
            return false;
        }
        
        std::cout << "✅ Email sent successfully to: " << toEmail << std::endl;
        return true;
    }
    
    std::cerr << "Failed to initialize CURL for email sending" << std::endl;
    return false;
}

std::string EmailService::getConfirmationEmailTemplate(
    const std::string& customerName,
    const std::string& restaurantName,
    const std::string& date,
    const std::string& time,
    int guestCount,
    const std::string& confirmationUrl
) {
    std::stringstream html;
    html << R"(
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Reservation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
        .btn { 
            display: inline-block; 
            background: #28a745; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
            font-weight: bold;
        }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍽️ BookBite</h1>
            <h2>Confirm Your Reservation</h2>
        </div>
        <div class="content">
            <p>Dear )" << customerName << R"(,</p>
            
            <p>Thank you for choosing <strong>)" << restaurantName << R"(</strong>! We have received your reservation request and need you to confirm it.</p>
            
            <div class="details">
                <h3>Reservation Details:</h3>
                <p><strong>Restaurant:</strong> )" << restaurantName << R"(</p>
                <p><strong>Date:</strong> )" << date << R"(</p>
                <p><strong>Time:</strong> )" << time << R"(</p>
                <p><strong>Guests:</strong> )" << guestCount << R"(</p>
            </div>
            
            <p>Please click the button below to confirm your reservation:</p>
            
            <div style="text-align: center;">
                <a href=")" << confirmationUrl << R"(" class="btn">Confirm Reservation</a>
            </div>
            
            <p><strong>Important:</strong> Your reservation is not confirmed until you click the confirmation link. This link will expire in 24 hours.</p>
            
            <p>If you did not make this reservation, please ignore this email.</p>
            
            <p>Best regards,<br>The BookBite Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this address.</p>
        </div>
    </div>
</body>
</html>
)";
    return html.str();
}

std::string EmailService::getConfirmedEmailTemplate(
    const std::string& customerName,
    const std::string& restaurantName,
    const std::string& date,
    const std::string& time,
    int guestCount,
    int reservationId
) {
    std::stringstream html;
    html << R"(
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .success { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍽️ BookBite</h1>
            <h2>✅ Reservation Confirmed!</h2>
        </div>
        <div class="content">
            <p>Dear )" << customerName << R"(,</p>
            
            <p class="success">Great news! Your reservation at <strong>)" << restaurantName << R"(</strong> has been confirmed.</p>
            
            <div class="details">
                <h3>Confirmed Reservation Details:</h3>
                <p><strong>Reservation ID:</strong> #)" << reservationId << R"(</p>
                <p><strong>Restaurant:</strong> )" << restaurantName << R"(</p>
                <p><strong>Date:</strong> )" << date << R"(</p>
                <p><strong>Time:</strong> )" << time << R"(</p>
                <p><strong>Guests:</strong> )" << guestCount << R"(</p>
            </div>
            
            <p><strong>What's next?</strong></p>
            <ul>
                <li>Please arrive 10-15 minutes before your reservation time</li>
                <li>If you need to cancel or modify your reservation, please visit our website</li>
                <li>For any questions, please contact the restaurant directly</li>
            </ul>
            
            <p>We look forward to serving you!</p>
            
            <p>Best regards,<br>The BookBite Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this address.</p>
        </div>
    </div>
</body>
</html>
)";
    return html.str();
}
