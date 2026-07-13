"""CRC16-CCITT implementation for VietQR checksum."""


def crc16_ccitt(data: str) -> str:
    """Calculate CRC16-CCITT (XMODEM) checksum for VietQR data string.

    Used to compute the last 4 hex characters of a NAPAS 247 QR string.
    Follows ISO/IEC 13239 / CRC-16/CCITT-FALSE algorithm.

    Args:
        data: QR data string (without CRC field).

    Returns:
        4-character uppercase hex string.
    """
    # TODO: Implement CRC16-CCITT calculation
    raise NotImplementedError("TODO: implement")
