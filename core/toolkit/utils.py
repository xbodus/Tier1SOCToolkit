import socket, ipaddress, re



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


