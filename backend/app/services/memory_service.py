import threading
from typing import Dict, List


class MemoryService:
    def __init__(self) -> None:
        self._store: Dict[str, List[Dict[str, str]]] = {}
        self._lock = threading.Lock()

    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        with self._lock:
            return list(self._store.get(session_id, []))

    def add_message(self, session_id: str, role: str, content: str) -> None:
        with self._lock:
            self._store.setdefault(session_id, []).append({"role": role, "content": content})

    def clear_history(self, session_id: str) -> None:
        with self._lock:
            self._store.pop(session_id, None)
