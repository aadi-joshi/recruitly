from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

# ...existing schemas...

class MemoryData(BaseModel):
    id: int
    type: str
    reference_id: int
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        orm_mode = True
