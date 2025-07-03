import Order from '../models/Order.js';

// Simulate tracking updates for demonstration
export const simulateTrackingUpdate = async (orderNumber, io) => {
  try {
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      console.log(`Order ${orderNumber} not found for simulation`);
      return;
    }

    // Initialize tracking if not exists
    if (!order.tracking) {
      order.tracking = { 
        trackingNumber: `TRK${Date.now()}`,
        carrier: 'Demo Express',
        updates: [] 
      };
    }

    // Simulate different tracking statuses
    const trackingStages = [
      {
        status: 'confirmed',
        message: 'Order confirmed and being prepared',
        location: 'Processing Center'
      },
      {
        status: 'processing',
        message: 'Order is being processed',
        location: 'Fulfillment Center'
      },
      {
        status: 'shipped',
        message: 'Package has been shipped',
        location: 'Origin Hub'
      },
      {
        status: 'in_transit',
        message: 'Package is in transit',
        location: 'Transit Hub'
      },
      {
        status: 'out_for_delivery',
        message: 'Out for delivery',
        location: 'Local Delivery Center'
      },
      {
        status: 'delivered',
        message: 'Package delivered successfully',
        location: 'Customer Address'
      }
    ];

    // Find current stage
    const currentUpdates = order.tracking.updates.length;
    const nextStage = trackingStages[currentUpdates];

    if (!nextStage) {
      console.log(`No more stages for order ${orderNumber}`);
      return;
    }

    // Add new tracking update
    const newUpdate = {
      status: nextStage.status,
      message: nextStage.message,
      location: nextStage.location,
      timestamp: new Date()
    };

    order.tracking.updates.push(newUpdate);
    
    // Update order status
    order.status = nextStage.status;
    
    await order.save();

    // Emit real-time update
    if (io) {
      io.to(`order_${order._id}`).emit('trackingUpdate', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        update: newUpdate,
        currentLocation: nextStage.location,
        status: nextStage.status
      });

      console.log(`Simulated tracking update for order ${orderNumber}: ${nextStage.message}`);
    }

    return order;
  } catch (error) {
    console.error('Error simulating tracking update:', error);
  }
};

// Auto-simulate updates for demo orders
export const startTrackingSimulation = (io) => {
  console.log('Starting tracking simulation for demo purposes...');
  
  // Simulate updates every 60 seconds for demo orders
  setInterval(async () => {
    try {
      // Find orders that are not delivered yet
      const activeOrders = await Order.find({
        status: { $nin: ['delivered', 'cancelled'] }
      }).limit(5); // Only simulate for up to 5 orders

      for (const order of activeOrders) {
        await simulateTrackingUpdate(order.orderNumber, io);
      }
    } catch (error) {
      console.error('Error in tracking simulation:', error);
    }
  }, 60000); // 60 seconds
};

export default {
  simulateTrackingUpdate,
  startTrackingSimulation
};