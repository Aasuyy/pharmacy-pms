"""
Backend Blockchain — Notary Service
In-memory blockchain for demo. Replace with Polygon/Hyperledger in production.
"""

import hashlib
import json
import time
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict

@dataclass
class Block:
    index: int
    timestamp: float
    data: Dict
    previous_hash: str
    hash: str = ""
    nonce: int = 0

    def calculate_hash(self) -> str:
        block_string = json.dumps({
            "index": self.index, "timestamp": self.timestamp,
            "data": self.data, "previous_hash": self.previous_hash, "nonce": self.nonce
        }, sort_keys=True, default=str)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty: int = 2):
        target = "0" * difficulty
        while not self.hash.startswith(target):
            self.nonce += 1
            self.hash = self.calculate_hash()

class PharmacyBlockchain:
    def __init__(self, difficulty: int = 2):
        self.chain: List[Block] = []
        self.difficulty = difficulty
        self.pending_transactions: List[Dict] = []
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis = Block(0, time.time(), {"message": "Pharmacy Genesis", "system": "PMS v1.0"}, "0")
        genesis.hash = genesis.calculate_hash()
        self.chain.append(genesis)

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def add_transaction(self, tx_type: str, record_id: str, data_hash: str,
                       performed_by: str, metadata: Optional[Dict] = None) -> Dict:
        tx = {
            "type": tx_type, "record_id": record_id, "data_hash": data_hash,
            "performed_by": performed_by, "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        self.pending_transactions.append(tx)
        return tx

    def mine_pending_transactions(self, miner: str = "pharmacy_system") -> Block:
        if not self.pending_transactions:
            return None
        new_block = Block(
            index=len(self.chain), timestamp=time.time(),
            data={"transactions": self.pending_transactions, "miner": miner},
            previous_hash=self.get_latest_block().hash
        )
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        self.pending_transactions = []
        return new_block

    def is_chain_valid(self) -> bool:
        for i in range(1, len(self.chain)):
            curr, prev = self.chain[i], self.chain[i-1]
            if curr.hash != curr.calculate_hash() or curr.previous_hash != prev.hash:
                return False
        return True

    def verify_record(self, record_id: str, expected_hash: str) -> Dict:
        for block in reversed(self.chain):
            for tx in block.data.get("transactions", []):
                if tx["record_id"] == record_id:
                    return {
                        "found": True, "block_index": block.index,
                        "block_hash": block.hash, "stored_hash": tx["data_hash"],
                        "matches": tx["data_hash"] == expected_hash,
                        "timestamp": tx["timestamp"], "performed_by": tx["performed_by"]
                    }
        return {"found": False}

    def get_drug_provenance(self, drug_code: str) -> List[Dict]:
        history = []
        for block in self.chain:
            for tx in block.data.get("transactions", []):
                if tx.get("metadata", {}).get("drug_code") == drug_code:
                    history.append({
                        "block_index": block.index, "action": tx["type"],
                        "timestamp": tx["timestamp"], "by": tx["performed_by"]
                    })
        return history

    def export_chain(self) -> List[Dict]:
        return [{
            "index": b.index, "timestamp": b.timestamp, "hash": b.hash,
            "previous_hash": b.previous_hash, "nonce": b.nonce, "data": b.data
        } for b in self.chain]

    def get_info(self) -> Dict:
        return {
            "total_blocks": len(self.chain), "is_valid": self.is_chain_valid(),
            "pending_transactions": len(self.pending_transactions),
            "latest_hash": self.get_latest_block().hash[:20] + "..."
        }

class BlockchainNotary:
    def __init__(self):
        self.chain = PharmacyBlockchain(difficulty=2)

    def hash_record(self, data: Dict) -> str:
        canonical = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(canonical.encode()).hexdigest()

    def notarize_drug_receipt(self, drug_id: int, drug_code: str, batch: str,
                               supplier: str, quantity: int, user: str) -> Dict:
        record = {"drug_id": drug_id, "drug_code": drug_code, "batch": batch,
                  "supplier": supplier, "quantity": quantity, "event": "DRUG_RECEIPT",
                  "timestamp": datetime.now().isoformat()}
        tx = self.chain.add_transaction("DRUG_RECEIPT", f"DRUG-{drug_id}",
                                         self.hash_record(record), user, {"drug_code": drug_code})
        self.chain.mine_pending_transactions()
        return tx

    def notarize_prescription(self, rx_code: str, patient_id: int, items: List[Dict],
                              total: float, pharmacist: str) -> Dict:
        record = {"rx_code": rx_code, "patient_id": patient_id, "items": items,
                  "total": total, "event": "PRESCRIPTION_DISPENSED",
                  "timestamp": datetime.now().isoformat()}
        tx = self.chain.add_transaction("PRESCRIPTION_DISPENSED", rx_code,
                                         self.hash_record(record), pharmacist,
                                         {"controlled": any(i.get("is_controlled") for i in items)})
        self.chain.mine_pending_transactions()
        return tx

    def notarize_sale(self, sale_code: str, items: List[Dict], total: float, cashier: str) -> Dict:
        record = {"sale_code": sale_code, "items": items, "total": total,
                  "event": "SALE_COMPLETED", "timestamp": datetime.now().isoformat()}
        tx = self.chain.add_transaction("SALE_COMPLETED", sale_code,
                                         self.hash_record(record), cashier)
        self.chain.mine_pending_transactions()
        return tx

    def verify_integrity(self, record_id: str, current_data: Dict) -> Dict:
        return self.chain.verify_record(record_id, self.hash_record(current_data))

    def get_info(self) -> Dict:
        return self.chain.get_info()

    def get_chain(self) -> List[Dict]:
        return self.chain.export_chain()
