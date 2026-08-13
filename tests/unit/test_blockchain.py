"""
Unit Tests — Blockchain Notary
"""

from src.backend.blockchain.notary import BlockchainNotary

class TestBlockchain:
    def test_chain_creation(self):
        notary = BlockchainNotary()
        info = notary.get_info()
        assert info["total_blocks"] == 1  # Genesis block
        assert info["is_valid"] is True

    def test_notarize_drug_receipt(self):
        notary = BlockchainNotary()
        tx = notary.notarize_drug_receipt(1, "PARA-500", "B2026-001", "MedSupply", 100, "admin")
        assert tx["type"] == "DRUG_RECEIPT"
        assert tx["record_id"] == "DRUG-1"

        info = notary.get_info()
        assert info["total_blocks"] == 2  # Genesis + mined block

    def test_integrity_verification(self):
        notary = BlockchainNotary()
        drug_data = {"id": 1, "code": "PARA-500", "stock": 100}
        notary.notarize_drug_receipt(1, "PARA-500", "B2026-001", "MedSupply", 100, "admin")

        result = notary.verify_integrity("DRUG-1", drug_data)
        assert result["found"] is True
        assert result["matches"] is True

    def test_tamper_detection(self):
        notary = BlockchainNotary()
        drug_data = {"id": 1, "code": "PARA-500", "stock": 100}
        notary.notarize_drug_receipt(1, "PARA-500", "B2026-001", "MedSupply", 100, "admin")

        tampered_data = {"id": 1, "code": "PARA-500", "stock": 999}
        result = notary.verify_integrity("DRUG-1", tampered_data)
        assert result["found"] is True
        assert result["matches"] is False
