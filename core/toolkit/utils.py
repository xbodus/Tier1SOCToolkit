import socket, ipaddress, re, sqlite3



def is_valid_target(target):
    ip_pattern = r'^\d{1,3}(\.\d{1,3}){3}$'
    ip_match = re.fullmatch(ip_pattern, target)

    if ip_match:
        try:
            ipaddress.IPv4Address(target)
            return True
        except ipaddress.AddressValueError:
            raise ipaddress.AddressValueError("Invalid IP address.")
    else:
        try:
            socket.gethostbyname(target)
            return True
        except socket.gaierror:
            raise  OSError("Invalid Hostname.")


"""
    GOAL: create two tables in sqlite db
        1.) Stores the date and the number of requests for the day: request_log.db
            Fields:
                - column name: data, type: text
                - column name: count, type: integer
        2.) Stores the requests data for that day: daily_request_count.db
            Fields:
                - column name: id, type: integer, primary key
                - column name: date, type: text
                - column name: ip_address, type: text
                - column name: timestamp, type: text
                
        Sample usage of sqlite module:
        
        In this function, it would initialize a database if one doesn't exist
        def init_db():
            conn = sqlite3.connect("abuseipdb_tracker.db") <--- tells the script was db to access. if not create, it will create it
            cursor = conn.cursor() <--- Needed to run sql commands
        
            # Table to log each request
            cursor.execute( <--- Actually creates the storage table if it doesn't exist
            CREATE TABLE IF NOT EXISTS request_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                ip_address TEXT NOT NULL,
                timestamp TEXT NOT NULL
            );
            )
        
            # Table to track daily count
            cursor.execute(
            CREATE TABLE IF NOT EXISTS daily_request_count (
                date TEXT PRIMARY KEY,
                count INTEGER NOT NULL
            );
            )
        
            conn.commit() <--- Save the changes (in this case the created tables)
            conn.close() <--- Exits the database connection
            
            After a DB has been created and tables have been insert, you can connect to the db in the same fashion, using conn = sqlite.connect and creating a cursor with conn.cursor().
            You can then use cursor.execute to continue using sql command to essentially do CRUD functionality.
            Just remember to save and close the connection after any execution commands.
            
            Important when fetching data:
            When running a select command from a db (cursor.execute("SELECT..."), the cursor doesn't directly return the results, instead it's saved like a state. Like if you were to call the command in the terminal, the state is what the command returned. 
            
            In order to fetch the data, you need to run one of the following commands:
                - cursor.fetchall()
                - cursor.fetchone() Returns the next line
                - cursor.fetchmany() Fetches in a specific amount
                
                *** These return a result that can be stored
"""

def init_db():
    conn = sqlite3.connect("abuseIPDB_tracker.db")
    cursor = conn.cursor()

    cursor.execute("""
       CREATE TABLE IF NOT EXISTS request_log
       (
           id         INTEGER PRIMARY KEY AUTOINCREMENT,
           ip_address TEXT NOT NULL,
           label      TEXT NOT NULL,
           ports      TEXT NOT NULL,
           timestamp  TEXT NOT NULL
       );
       """)

    """
    malicious_ips
        🚨 Purpose: Cache of confirmed-bad IPs.
        
        ✅ Your logic checks this first before hitting the API. If the IP is already marked malicious, you skip the API and pull from this table instead.
        
        Should have: ip_address, threat_level, abuse_score, confidence, categories, timestamp, etc.
        
        ✅ Should have a UNIQUE constraint on ip_address.
    """
    cursor.execute("""
                   CREATE TABLE IF NOT EXISTS malicious_ips
                   (
                       id         INTEGER PRIMARY KEY AUTOINCREMENT,
                       date       TEXT NOT NULL,
                       ip_address TEXT NOT NULL,
                       timestamp  TEXT NOT NULL
                   );
                   """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS daily_request_count (
            date TEXT PRIMARY KEY,
            count INTEGER NOT NULL
        )
    """)

    conn.commit()
    conn.close()
