from django.urls import path
from .views import PaymentSuccessView, PaymentCancelView, InitiateGeneralPaymentView #, MockPaymentSuccessView

app_name = 'payments'

urlpatterns = [
    path('success/<str:session_id>/', PaymentSuccessView.as_view(), name='payment_success'),
    path('cancel/', PaymentCancelView.as_view(), name='payment_cancel'),
    path('initiate-general-payment/', InitiateGeneralPaymentView.as_view(), name='initiate_general_payment'),
] 