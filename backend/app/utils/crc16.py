"""CRC16-CCITT implementation for VietQR checksum."""


def crc16_ccitt(data: str) -> str:
    """Calculate CRC16-CCITT (XMODEM/CCITT-FALSE) checksum for VietQR data string.

    Used to compute the last 4 hex characters of a NAPAS 247 QR string.
    Follows ISO/IEC 13239 / CRC-16/CCITT-FALSE algorithm.
    Polynomial: 0x1021, Initial value: 0xFFFF.

    Args:
        data: QR data string (without CRC field).

    Returns:
        4-character uppercase hex string.
    """
    crc = 0xFFFF
    for char in data:
        crc ^= ord(char) << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = (crc << 1) ^ 0x1021
            else:
                crc = crc << 1
            crc &= 0xFFFF
    return f"{crc:04X}"
