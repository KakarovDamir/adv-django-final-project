import stripe
from django.conf import settings
from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from rest_framework import status
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

# Убираем этот импорт с верхнего уровня
# from ai.views.cbv import _perform_video_generation 
from ai.serializers import VideoPromptSerializer
from ai.models import VideoPrompt
from django.contrib.auth import get_user_model
User = get_user_model()

import logging
logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_stripe_checkout_session_for_prompt(request, prompt_text: str, user_id: str):
    your_domain = settings.BACKEND_DOMAIN_URL 
    try:
        user_id_str = str(user_id) if user_id is not None else "anonymous"

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Video Generation Prompt',
                        },
                        'unit_amount': getattr(settings, 'VIDEO_GENERATION_PRICE', getattr(settings, 'STRIPE_PRICE_AMOUNT', 500)), 
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=your_domain + f'/payments/success/{{CHECKOUT_SESSION_ID}}/', 
            cancel_url=your_domain + '/payments/cancel/',
            metadata={
                'prompt_text': prompt_text,
                'user_id': user_id_str
            }
        )
        logger.info(f"Stripe Checkout session created: {checkout_session.id} for user {user_id_str} with prompt: '{prompt_text}'")
        logger.info(f"Success URL for Stripe: {your_domain + f'/payments/success/{{CHECKOUT_SESSION_ID}}/'}")
        return checkout_session.url, checkout_session.id
    except Exception as e:
        logger.error(f"Error creating Stripe checkout session: {e}", exc_info=True)
        return None, None

@method_decorator(csrf_exempt, name='dispatch')
class PaymentSuccessView(View):
    def get(self, request, session_id): 
        logger.info(f"Payment success redirect received for session_id: {session_id}")
        
        if not session_id or session_id == '{CHECKOUT_SESSION_ID}': 
            logger.error(f"Invalid session_id: '{session_id}'. Stripe did not replace the placeholder.")
            return JsonResponse({'error': 'Invalid session ID received. Stripe placeholder was not replaced.'}, status=400)

        try:
            logger.info(f"Verifying Stripe session: {session_id}")
            checkout_session = stripe.checkout.Session.retrieve(session_id)
            logger.info(f"Stripe session retrieved: {checkout_session.id}, status: {checkout_session.payment_status}")

            if checkout_session.payment_status == "paid":
                metadata = checkout_session.metadata
                user_id = metadata.get('user_id') 
                product_name = metadata.get('product_name')
                
                logger.info(f"Payment successful for session {session_id}. User ID: {user_id}. Product: '{product_name}'. Metadata: {metadata}")
                
                return JsonResponse({
                    'message': 'Payment successful.',
                    'session_id': checkout_session.id,
                    'user_id': user_id,
                    'product_name': product_name,
                    'payment_metadata': metadata 
                }, status=200)
            else:
                logger.warning(f"Payment not successful for session {session_id}. Status: {checkout_session.payment_status}")
                return JsonResponse({'error': 'Payment was not successful.'}, status=400)

        except stripe.error.InvalidRequestError as e:
            if "No such checkout.session" in str(e):
                 logger.error(f"Stripe Error: 'No such checkout.session: {session_id}'. This means Stripe could not find the session. It might be due to using test keys with a live session ID or vice-versa, or the session ID is genuinely incorrect or expired, or the {{CHECKOUT_SESSION_ID}} placeholder was not replaced.", exc_info=True)
                 return JsonResponse({'error': f"Stripe: No such checkout session '{session_id}'. Placeholder not replaced or invalid ID."}, status=400)
            logger.error(f"Stripe API InvalidRequestError in PaymentSuccessView for session_id {session_id}: {e}", exc_info=True)
            return JsonResponse({'error': f'Stripe API error: {str(e)}'}, status=500)
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error in PaymentSuccessView for session_id {session_id}: {e}", exc_info=True)
            return JsonResponse({'error': f'Stripe API error: {str(e)}'}, status=500)
        except Exception as e:
            logger.error(f"Unexpected error in PaymentSuccessView for session_id {session_id}: {e}", exc_info=True)
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class PaymentCancelView(View):
    def get(self, request):
        logger.info("Payment cancelled by user.")
        return JsonResponse({'message': 'Payment was cancelled.'}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class InitiateGeneralPaymentView(APIView):
    authentication_classes = []  
    permission_classes = [AllowAny]  

    def post(self, request, *args, **kwargs):
        product_name = request.data.get("product_name")
        unit_amount = request.data.get("unit_amount") 
        user_id = request.data.get("user_id")
        custom_metadata = request.data.get("custom_metadata", {})

        if not all([product_name, unit_amount, user_id]):
            return Response({
                "error": "Missing required fields: product_name, unit_amount, user_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            unit_amount_int = int(unit_amount)
            if unit_amount_int <= 0:
                raise ValueError("Amount must be positive.")
        except ValueError:
            return Response(
                {"error": "Invalid unit_amount. Must be a positive integer representing cents."},
                status=status.HTTP_400_BAD_REQUEST
            )

        your_domain = settings.BACKEND_DOMAIN_URL
        user_id_str = str(user_id) if user_id is not None else "anonymous"

        stripe_metadata = {
            'user_id': user_id_str,
            'product_name': product_name,
        }
        if isinstance(custom_metadata, dict):
            stripe_metadata.update(custom_metadata)
        else:
            logger.warning("custom_metadata was not a dict, ignoring.")

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': product_name,
                            },
                            'unit_amount': unit_amount_int,
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url=your_domain + f'/payments/success/{{CHECKOUT_SESSION_ID}}/',
                cancel_url=your_domain + '/payments/cancel/',
                metadata=stripe_metadata
            )
            logger.info(f"General Stripe Checkout session created: {checkout_session.id} for user {user_id_str} for product '{product_name}'")
            return Response({"checkout_url": checkout_session.url, "session_id": checkout_session.id}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error creating general Stripe checkout session: {e}", exc_info=True)
            return Response({"error": "Could not initiate general payment session.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def create_mock_checkout_for_prompt(prompt_text, user_id, request_obj):
    try:
        request_obj.session['mock_payment_prompt_text'] = prompt_text
        if user_id:
            request_obj.session['mock_payment_user_id'] = user_id
        else:
            request_obj.session.pop('mock_payment_user_id', None)
        request_obj.session.save()

        mock_success_url = request_obj.build_absolute_uri(reverse('payments:mock_payment_success'))
        
        logger.info(f"[MOCK_PAYMENT] Generated mock_success_url: {mock_success_url}")
        print(f"[MOCK_PAYMENT_PRINT] Generated mock_success_url: {mock_success_url}")
        
        return {'checkout_url': mock_success_url}
    except Exception as e:
        logger.error(f"Error in create_mock_checkout_for_prompt: {str(e)}", exc_info=True)
        return {'error': str(e)}

@method_decorator(csrf_exempt, name='dispatch')
class MockPaymentSuccessView(View):
    def get(self, request, *args, **kwargs):
        from ai.views.cbv import _perform_video_generation
        
        logger.info("[MOCK_PAYMENT] Reached MockPaymentSuccessView")

        prompt_text = request.session.get('mock_payment_prompt_text')
        user_id_from_session = request.session.get('mock_payment_user_id')

        request.session.pop('mock_payment_prompt_text', None)
        request.session.pop('mock_payment_user_id', None)
        request.session.save()

        request_user = None
        if user_id_from_session:
            try:
                request_user = User.objects.get(id=int(user_id_from_session))
            except (User.DoesNotExist, ValueError):
                logger.warning(f"[MOCK_PAYMENT] User with ID '{user_id_from_session}' from session not found or invalid.")
        
        if not prompt_text:
            logger.error("[MOCK_PAYMENT] Prompt not found in session for mock payment.")
            return JsonResponse({'error': 'Critical: Mock Payment successful, but prompt not found in session.'}, status=500)

        logger.info(f"[MOCK_PAYMENT] Starting video generation for prompt: \"{prompt_text}\" (User ID from session: {user_id_from_session})")
        
        video_generation_result = _perform_video_generation(user_prompt=prompt_text, request_user=request_user) 
        
        if isinstance(video_generation_result, VideoPrompt) or (isinstance(video_generation_result, dict) and not video_generation_result.get('error')):
            if isinstance(video_generation_result, VideoPrompt):
                serializer = VideoPromptSerializer(video_generation_result)
                final_data = serializer.data
            else: 
                final_data = video_generation_result
            logger.info(f"[MOCK_PAYMENT] Video generation successful. Data: {final_data}")
            return JsonResponse(final_data, status=200)
        else:
            error_message = video_generation_result.get('error', 'Unknown error during video generation')
            logger.error(f"[MOCK_PAYMENT] Video generation failed: {error_message}")
            return JsonResponse({
                'status': 'mock_payment_success_generation_failed',
                'message': f"Mock Payment successful, but video generation failed: {error_message}",
                'prompt': prompt_text
            }, status=500)