# Restaurant Reservation System

## OTJ Project for 10th Graders
This document describes the **OTJ project** for 10th graders. 

## 1. Assignment Goals
The **Restaurant Reservation System** allows customers to reserve tables at their favorite restaurants. The system contains information about different restaurants in various cities and the seating arrangements in each restaurant. Each restaurant can have multiple available time slots for reservations. The customer can search and select a restaurant and preferred time slot for their reservation. The system displays a seating layout showing available and reserved tables so that the customer can choose an available table. Once the customer confirms the reservation and provides necessary details, they receive a confirmation email.

## 2. Expectations from the Interviewee
Numerous components are present in a typical restaurant reservation system, each with specific constraints and requirements. The following is an overview of some of the main expectations that the interviewer will want to hear you discuss in detail.

### 2.1. Table Selection
Selecting a table is an essential part of the reservation system. The system must ensure that no two customers can reserve the same table at the same time. Important questions include:
- How will the system ensure that multiple users do not reserve the same table?
- Will there be a session timeout that holds a table temporarily during selection?
- Will the system use a first-come, first-serve algorithm?
- Will transaction locks be involved in the reservation process?

### 2.2. Payment Handling 
If the restaurant requires a deposit or prepayment for certain reservations, this becomes an important component. Key considerations include:
- What payment methods are supported (credit card, online payment platforms, etc.)?
- Is payment optional or mandatory for certain types of reservations?

### 2.3. Price Variance
Some restaurants may have different pricing models for reservations. Relevant questions include:
- Will the cost of reserving a table vary depending on the time (e.g., peak hours vs. off-peak)?
- Are there different types of tables with different prices (e.g., outdoor, VIP sections)?
- Will the system support discount codes or promotional offers?

### 2.4. Duplication
The interviewer expects clarification on how the system handles multiple instances of similar tables and time slots:
- How will the system manage simultaneous reservations for different time slots?
- How are we handling scenarios where multiple branches of the same restaurant chain are available in the same city?

## 3. Requirements for the Restaurant Reservation System
The following are the requirements defined for the system:

### **Stage One**
- **R1**: There exist multiple restaurants in the city, and each restaurant has multiple seating areas.
- **R2**: Each restaurant offers multiple time slots for reservations, but a table can only be reserved for one time slot at a time.
- **R3**: The system displays all available reservation time slots for each restaurant.
- **R4**: Users can search for restaurants based on the following criteria: name, location, cuisine, and available time slots.

### **Stage Two**
- **R5**: Users can make reservations for any available time slot at a restaurant.
- **R6**: Reservations can be made online by customers or in person by restaurant staff.
- **R7**: Online customers can only pay using a credit card, while walk-in customers can pay using cash or credit card.

### **Stage Three**
- **R8**: Users can select multiple available tables for a reservation from a given seating arrangement.
- **R9**: Each table has a specific seating capacity (e.g., 2-person table, 4-person table, etc.).
- **R10**: There can only be one reservation per table for a given time slot.
- **R11**: No two customers should be able to reserve the same table for the same time slot.

### **Stage Four**
- **R12**: The **restaurant admin** can perform the following actions on reservations and tables:
    - Add a new reservation
    - Cancel a reservation
    - Update reservation details
    - Add or remove tables
    - Modify available time slots

### **Stage Five**
- **R13**: The system should be able to differentiate between available and reserved tables in real-time.
- **R14**: The system should generate notifications for the following cases:
    - A new reservation has been made.
    - A reservation has been canceled.
    - A reminder notification before the reservation time.

## 4. Base Requirements
- **Programming Language:** C++
- **Development Environment:** CLion
- **Version Control:** Git for Windows (latest release)
- **Skills Required:**
    - Working with Git from the command line (CLI)
    - Following best practices for C++ / Git / GitHub.

_Additional requirements will be added later._
