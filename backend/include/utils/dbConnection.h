#ifndef DB_CONNECTION_H
#define DB_CONNECTION_H

#include <nanodbc/nanodbc.h>
#include <string>

class DbConnection {
public:
    DbConnection();
    ~DbConnection();
    nanodbc::connection getConnection(); // Create new connection each time
    static nanodbc::connection createConnection(); // Static method for new connections
    bool isConnected();

private:
    nanodbc::connection connection;
    std::string connectionString;
    void setupConnection();
};

#endif // DB_CONNECTION_H
