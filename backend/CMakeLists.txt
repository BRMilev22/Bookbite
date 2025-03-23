cmake_minimum_required(VERSION 3.12)
project(BookBite VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Find Crow
find_package(Crow QUIET)
if(NOT Crow_FOUND)
    include(FetchContent)
    FetchContent_Declare(
        Crow
        GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
        GIT_TAG v1.0+5
    )
    FetchContent_MakeAvailable(Crow)
endif()

# Find OpenSSL for SHA-256 hashing
find_package(OpenSSL REQUIRED)

# Find MySQL and nanodbc
find_path(NANODBC_INCLUDE_DIR nanodbc/nanodbc.h HINTS /usr/local/include)
find_library(NANODBC_LIBRARY nanodbc HINTS /usr/local/lib)

# Find ODBC libraries
find_library(ODBC_LIBRARY odbc)
find_library(IODBCINST_LIBRARY iODBCinst)

# If not found via find_library, try finding it in Homebrew
if(NOT NANODBC_INCLUDE_DIR OR NOT NANODBC_LIBRARY)
    execute_process(
        COMMAND brew --prefix nanodbc
        OUTPUT_VARIABLE NANODBC_PREFIX
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )
    if(NANODBC_PREFIX)
        set(NANODBC_INCLUDE_DIR "${NANODBC_PREFIX}/include")
        set(NANODBC_LIBRARY "${NANODBC_PREFIX}/lib/libnanodbc.dylib")
    endif()
endif()

if(NOT ODBC_LIBRARY OR NOT IODBCINST_LIBRARY)
    execute_process(
        COMMAND brew --prefix unixodbc
        OUTPUT_VARIABLE ODBC_PREFIX
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )
    if(ODBC_PREFIX)
        set(ODBC_LIBRARY "${ODBC_PREFIX}/lib/libodbc.dylib")
        set(IODBCINST_LIBRARY "${ODBC_PREFIX}/lib/libiodbc.dylib")
    endif()
endif()

# Check for MariaDB ODBC driver
find_library(MARIADB_ODBC_LIBRARY maodbc PATHS "/usr/local/lib" "/opt/homebrew/lib")

if(NOT NANODBC_INCLUDE_DIR OR NOT NANODBC_LIBRARY)
    message(FATAL_ERROR "nanodbc library not found. Please install it via Homebrew.")
endif()

if(NOT ODBC_LIBRARY AND NOT IODBCINST_LIBRARY)
    message(FATAL_ERROR "ODBC libraries not found. Please install unixodbc via Homebrew.")
endif()

# Source files
file(GLOB_RECURSE SOURCE_FILES
    "src/*.cpp"
)

# Add executable
add_executable(bookbite_server ${SOURCE_FILES})

# Include directories
target_include_directories(bookbite_server PRIVATE
    ${NANODBC_INCLUDE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Link libraries
target_link_libraries(bookbite_server PRIVATE
    Crow::Crow
    ${NANODBC_LIBRARY}
    OpenSSL::SSL
    OpenSSL::Crypto
)

# Link ODBC libraries if found
if(ODBC_LIBRARY)
    target_link_libraries(bookbite_server PRIVATE ${ODBC_LIBRARY})
    message(STATUS "Linking with ODBC library: ${ODBC_LIBRARY}")
endif()

if(IODBCINST_LIBRARY)
    target_link_libraries(bookbite_server PRIVATE ${IODBCINST_LIBRARY})
    message(STATUS "Linking with iODBCinst library: ${IODBCINST_LIBRARY}")
endif()

if(MARIADB_ODBC_LIBRARY)
    target_link_libraries(bookbite_server PRIVATE ${MARIADB_ODBC_LIBRARY})
    message(STATUS "Linking with MariaDB ODBC library: ${MARIADB_ODBC_LIBRARY}")
endif()

# Copy the built executable to the root of the project
add_custom_command(TARGET bookbite_server POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy
    $<TARGET_FILE:bookbite_server>
    ${CMAKE_SOURCE_DIR}/../bookbite_server
)

# Print helpful message
message(STATUS "nanodbc include dir: ${NANODBC_INCLUDE_DIR}")
message(STATUS "nanodbc library: ${NANODBC_LIBRARY}")
message(STATUS "ODBC library: ${ODBC_LIBRARY}")
message(STATUS "iODBCinst library: ${IODBCINST_LIBRARY}")
message(STATUS "MariaDB ODBC library: ${MARIADB_ODBC_LIBRARY}") 