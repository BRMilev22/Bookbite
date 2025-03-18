#include "../../include/services/customer_service.h"
#include <stdexcept>
#include <iostream>

CustomerService::CustomerService(Database& db) : db(db) {}

std::vector<Customer> CustomerService::getAllCustomers() {
    std::vector<Customer> customers;
    auto result = db.query("SELECT * FROM customers");
    
    while (result.next()) {
        Customer customer;
        customer.id = result.get<int>(0);
        customer.firstName = result.get<std::string>(1);
        customer.lastName = result.get<std::string>(2);
        customer.email = result.get<std::string>(3);
        customer.phone = result.get<std::string>(4);
        customers.push_back(customer);
    }
    return customers;
}

std::optional<Customer> CustomerService::getCustomerById(int id) {
    auto result = db.query("SELECT * FROM customers WHERE customer_id = " + std::to_string(id));
    
    if (result.next()) {
        Customer customer;
        customer.id = result.get<int>(0);
        customer.firstName = result.get<std::string>(1);
        customer.lastName = result.get<std::string>(2);
        customer.email = result.get<std::string>(3);
        customer.phone = result.get<std::string>(4);
        return customer;
    }
    return std::nullopt;
}

std::optional<Customer> CustomerService::getCustomerByEmail(const std::string& email) {
    auto result = db.query("SELECT * FROM customers WHERE email = '" + email + "'");
    
    if (result.next()) {
        Customer customer;
        customer.id = result.get<int>(0);
        customer.firstName = result.get<std::string>(1);
        customer.lastName = result.get<std::string>(2);
        customer.email = result.get<std::string>(3);
        customer.phone = result.get<std::string>(4);
        return customer;
    }
    return std::nullopt;
}

int CustomerService::createCustomer(const Customer& customer) {
    // First check if a customer with this email already exists
    auto existingCustomer = getCustomerByEmail(customer.email);
    if (existingCustomer) {
        // If customer already exists, return their ID
        std::cout << "Customer with email " << customer.email << " already exists with ID " << existingCustomer->id << std::endl;
        return existingCustomer->id;
    }
    
    // If a specific ID is requested, try to use it
    if (customer.id > 0) {
        // Check if ID is already in use
        auto existingCustomerWithId = getCustomerById(customer.id);
        if (!existingCustomerWithId) {
            // ID is available, use it
            std::string sql = "INSERT INTO customers (customer_id, first_name, last_name, email, phone) VALUES (" +
                             std::to_string(customer.id) + ", '" +
                             customer.firstName + "', '" + customer.lastName + "', '" +
                             customer.email + "', '" + customer.phone + "')";
            
            try {
                db.execute(sql);
                return customer.id;
            } catch (const std::exception& e) {
                std::cerr << "Error creating customer with specific ID: " << e.what() << std::endl;
                // Fall back to auto-generated ID
            }
        } else {
            std::cout << "Customer ID " << customer.id << " is already in use, falling back to auto-generated ID" << std::endl;
        }
    }
    
    // Default: let the database auto-generate an ID
    std::string sql = "INSERT INTO customers (first_name, last_name, email, phone) VALUES ('" +
                     customer.firstName + "', '" + customer.lastName + "', '" +
                     customer.email + "', '" + customer.phone + "')";
    
    try {
        db.execute(sql);
        auto result = db.query("SELECT LAST_INSERT_ID()");
        if (result.next()) {
            return result.get<int>(0);
        }
    } catch (const std::exception& e) {
        std::cerr << "Error creating customer: " << e.what() << std::endl;
    }
    
    return -1;
}

bool CustomerService::updateCustomer(const Customer& customer) {
    std::string sql = "UPDATE customers SET first_name = '" + customer.firstName +
                     "', last_name = '" + customer.lastName +
                     "', email = '" + customer.email +
                     "', phone = '" + customer.phone +
                     "' WHERE customer_id = " + std::to_string(customer.id);
    
    try {
        db.execute(sql);
        return true;
    } catch (...) {
        return false;
    }
}

bool CustomerService::deleteCustomer(int id) {
    try {
        db.execute("DELETE FROM customers WHERE customer_id = " + std::to_string(id));
        return true;
    } catch (...) {
        return false;
    }
} 