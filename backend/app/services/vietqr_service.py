"""VietQR code generation — NAPAS 247 standard + CRC16."""

from app.utils.crc16 import crc16_ccitt


class VietQRService:
    """Generate VietQR codes per NAPAS 247 standard."""

    @staticmethod
    def generate_qr_string(
        bank_bin: str,
        account_no: str,
        account_name: str,
        amount: int,
        description: str,
    ) -> str:
        """Generate VietQR NAPAS 247 string with CRC16 checksum.

        Format: 00020101021238570010A00000072701270008<BIN>0113<STK>
                0208QRIBFTTA53037045405<VND>5802VN62<Name>08<Desc>6304<CRC>
        """
        raise NotImplementedError("TODO: implement NAPAS 247 string generation")
