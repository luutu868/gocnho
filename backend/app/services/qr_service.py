"""QR code generation for tables."""

from io import BytesIO


class QRService:
    """Generate QR codes for tables."""

    @staticmethod
    async def generate_table_qr(table_code: str, base_url: str) -> bytes:
        """Generate a QR code PNG for a table.

        The QR encodes: {base_url}/?table={table_code}
        Returns PNG bytes.
        """
        raise NotImplementedError("TODO")

    @staticmethod
    async def zip_all_qr() -> bytes:
        """Generate a ZIP file containing all table QR codes as PNGs."""
        raise NotImplementedError("TODO")
