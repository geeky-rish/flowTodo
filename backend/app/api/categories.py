from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_db
from app.services.category_service import CategoryService
from app.schemas.task import CategoryCreate, CategoryUpdate, CategoryResponse, MessageResponse

router = APIRouter(prefix="/categories", tags=["categories"])


def get_cat_service() -> CategoryService:
    return CategoryService(get_db())


@router.get("")
async def list_categories(svc: CategoryService = Depends(get_cat_service)):
    return await svc.get_categories()


@router.post("", status_code=201)
async def create_category(data: CategoryCreate, svc: CategoryService = Depends(get_cat_service)):
    return await svc.create_category(data)


@router.put("/{cat_id}")
async def update_category(cat_id: str, data: CategoryUpdate, svc: CategoryService = Depends(get_cat_service)):
    cat = await svc.update_category(cat_id, data)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.delete("/{cat_id}", response_model=MessageResponse)
async def delete_category(cat_id: str, svc: CategoryService = Depends(get_cat_service)):
    deleted = await svc.delete_category(cat_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted", "success": True}
