"""VietQR code generation — NAPAS 247 standard + CRC16."""

import io
import base64
import qrcode
from app.utils.crc16 import crc16_ccitt


class VietQRService:
    """Generate VietQR codes per NAPAS 247 standard."""

    @staticmethod
    def _tlv(tag: str, value: str) -> str:
        """Format as Tag-Length-Value."""
        return f"{tag}{len(value):02d}{value}"

    @staticmethod
    def generate_qr_string(
        bank_bin: str,
        account_no: str,
        account_name: str,
        amount: int,
        description: str,
    ) -> str:
        """Generate VietQR NAPAS 247 string with CRC16 checksum."""
        # Tag 38: Beneficiary Organization
        guid = VietQRService._tlv("00", "A000000727")
        acq_bin = VietQRService._tlv("00", bank_bin)
        acq_account = VietQRService._tlv("01", account_no)
        acquirer_info = VietQRService._tlv("01", acq_bin + acq_account)
        service_code = VietQRService._tlv("02", "QRIBFTTA")
        tag38_value = guid + acquirer_info + service_code
        tag38 = VietQRService._tlv("38", tag38_value)
        
        # Tag 54: Transaction Amount
        tag54 = VietQRService._tlv("54", str(amount))
        
        # Tag 59: Merchant Name (limit to 25 chars per EMVCo)
        # Note: VietQR ignores accents, so we keep it simple.
        name_clean = account_name[:25].upper()
        tag59 = VietQRService._tlv("59", name_clean)
        
        # Tag 62: Additional Data (Description)
        desc_tlv = VietQRService._tlv("08", description)
        tag62 = VietQRService._tlv("62", desc_tlv)

        # Assemble Payload
        payload = (
            VietQRService._tlv("00", "01") +  # Payload Format Indicator
            VietQRService._tlv("01", "12") +  # Point of Initiation Method (12 = Dynamic)
            tag38 +
            VietQRService._tlv("53", "704") + # Currency: VND
            tag54 +
            VietQRService._tlv("58", "VN") +  # Country: VN
            tag59 +
            VietQRService._tlv("60", "HANOI") + # City
            tag62 +
            "6304" # CRC Tag & Length
        )

        crc = crc16_ccitt(payload)
        return payload + crc

    @staticmethod
    def generate_qr_base64(
        bank_bin: str,
        account_no: str,
        account_name: str,
        amount: int,
        description: str,
    ) -> str:
        """Generate VietQR string and encode as a Base64 PNG data URI."""
        qr_string = VietQRService.generate_qr_string(
            bank_bin, account_no, account_name, amount, description
        )
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_string)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        return f"data:image/png;base64,{b64_str}"
