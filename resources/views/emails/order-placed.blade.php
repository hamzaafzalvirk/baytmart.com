<h1>Thank you for your BaytMart order</h1>
<p>Hi {{ $order->customer_name }}, your order <strong>{{ $order->order_number }}</strong> has been received.</p>
<p>Total: <strong>${{ number_format((float) $order->total, 2) }}</strong></p>
<p>We will deliver to {{ $order->address }}, {{ $order->city }}, {{ $order->country }}.</p>