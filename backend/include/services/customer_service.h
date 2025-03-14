#pragma once

#include "../models/customer.h"
#include "../database/db_manager.h"
#include <vector>
#include <optional>

// Simple customer service for handling customer operations
class CustomerService {
public:
    CustomerService(Database& db);

    // Get all customers
    std::vector<Customer> getAllCustomers();

    // Get customer by ID
    std::optional<Customer> getCustomerById(int id);
    
    // Get customer by email
    std::optional<Customer> getCustomerByEmail(const std::string& email);

    // Create new customer
    int createCustomer(const Customer& customer);

    // Update customer
    bool updateCustomer(const Customer& customer);

    // Delete customer
    bool deleteCustomer(int id);

private:
    Database& db;
}; 