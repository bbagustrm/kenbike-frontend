import OrdersPage from "@/components/admin/page/OrdersPage";

export default function AdminOrdersPage() {
    return (
        <OrdersPage
            customTitle="Order Management"
            customDescription="Manage and track all customer orders"
            basePath="/admin/orders"
        />
    );
}