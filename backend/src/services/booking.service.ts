import { prisma } from '../lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * Booking Service
 *
 * Manages service bookings and appointments
 */

export interface CreateBookingRequest {
  userId: string;
  providerId: string;
  serviceType: string;
  scheduledAt: Date;
  duration: number;
  price: number;
  notes?: string;
}

export interface BookingFilters {
  userId?: string;
  providerId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Create a new booking
 */
export const createBooking = async (data: CreateBookingRequest) => {
  // Verify provider exists and is active
  const provider = await prisma.serviceProvider.findFirst({
    where: {
      id: data.providerId,
      status: 'active',
    },
  });

  if (!provider) {
    throw new Error('Service provider not found or inactive');
  }

  // Check for scheduling conflicts
  const conflict = await prisma.booking.findFirst({
    where: {
      providerId: data.providerId,
      status: {
        in: ['pending', 'confirmed'],
      },
      scheduledAt: {
        lte: new Date(data.scheduledAt.getTime() + data.duration * 60 * 1000),
      },
      OR: [
        {
          scheduledAt: {
            gte: data.scheduledAt,
          },
        },
      ],
    },
  });

  if (conflict) {
    throw new Error('Time slot is already booked');
  }

  // Create Stripe payment intent
  let stripePaymentId: string | undefined;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        providerId: data.providerId,
        serviceType: data.serviceType,
        userId: data.userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    stripePaymentId = paymentIntent.id;
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    // Continue without payment intent - will be pending
  }

  // Create booking
  return prisma.booking.create({
    data: {
      userId: data.userId,
      providerId: data.providerId,
      serviceType: data.serviceType,
      scheduledAt: data.scheduledAt,
      duration: data.duration,
      price: data.price,
      notes: data.notes,
      stripePaymentId,
      status: 'pending',
      paymentStatus: 'pending',
    },
    include: {
      provider: {
        include: {
          category: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get bookings with filters
 */
export const getBookings = async (
  filters: BookingFilters = {},
  page: number = 1,
  limit: number = 20
) => {
  const where: any = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.providerId) {
    where.providerId = filters.providerId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.scheduledAt = {};
    if (filters.startDate) {
      where.scheduledAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.scheduledAt.lte = filters.endDate;
    }
  }

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        provider: {
          include: {
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        review: true,
      },
      orderBy: { scheduledAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single booking
 */
export const getBooking = async (bookingId: string) => {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      provider: {
        include: {
          category: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      review: true,
    },
  });
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: string,
  note?: string
) => {
  const data: any = { status };

  if (status === 'completed') {
    data.completedAt = new Date();
  } else if (status === 'cancelled') {
    data.cancelledAt = new Date();
    if (note) {
      data.cancellationNote = note;
    }
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data,
    include: {
      provider: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Confirm booking payment
 */
export const confirmPayment = async (bookingId: string, paymentIntentId: string) => {
  // Verify payment with Stripe
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not completed');
    }

    // Update booking
    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'paid',
        status: 'confirmed',
      },
      include: {
        provider: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    throw new Error('Failed to confirm payment');
  }
};

/**
 * Cancel booking and process refund
 */
export const cancelBooking = async (
  bookingId: string,
  reason?: string,
  refund: boolean = true
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'cancelled') {
    throw new Error('Booking already cancelled');
  }

  if (booking.status === 'completed') {
    throw new Error('Cannot cancel completed booking');
  }

  // Process refund if payment was made
  if (refund && booking.stripePaymentId && booking.paymentStatus === 'paid') {
    try {
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentId,
      });

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'refunded',
        },
      });
    } catch (error) {
      console.error('Refund failed:', error);
      // Continue with cancellation even if refund fails
    }
  }

  // Update booking status
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationNote: reason,
    },
    include: {
      provider: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Get upcoming bookings for a user
 */
export const getUpcomingBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: {
      userId,
      status: {
        in: ['pending', 'confirmed'],
      },
      scheduledAt: {
        gte: new Date(),
      },
    },
    include: {
      provider: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 10,
  });
};

/**
 * Get booking statistics
 */
export const getBookingStats = async (filters: BookingFilters = {}) => {
  const where: any = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.providerId) {
    where.providerId = filters.providerId;
  }

  if (filters.startDate || filters.endDate) {
    where.scheduledAt = {};
    if (filters.startDate) {
      where.scheduledAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.scheduledAt.lte = filters.endDate;
    }
  }

  const [total, pending, confirmed, completed, cancelled] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.count({ where: { ...where, status: 'pending' } }),
    prisma.booking.count({ where: { ...where, status: 'confirmed' } }),
    prisma.booking.count({ where: { ...where, status: 'completed' } }),
    prisma.booking.count({ where: { ...where, status: 'cancelled' } }),
  ]);

  const bookings = await prisma.booking.findMany({
    where: { ...where, paymentStatus: 'paid' },
    select: { price: true },
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);

  return {
    total,
    byStatus: {
      pending,
      confirmed,
      completed,
      cancelled,
    },
    totalRevenue,
    averageBookingValue: total > 0 ? totalRevenue / total : 0,
  };
};

/**
 * Check provider availability
 */
export const checkAvailability = async (
  providerId: string,
  date: Date,
  duration: number
) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      status: {
        in: ['pending', 'confirmed'],
      },
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  // Generate available time slots (9 AM to 5 PM)
  const availableSlots: Date[] = [];
  const workStart = 9; // 9 AM
  const workEnd = 17; // 5 PM

  for (let hour = workStart; hour < workEnd; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slot = new Date(date);
      slot.setHours(hour, minute, 0, 0);

      // Check if slot conflicts with existing bookings
      const hasConflict = bookings.some(booking => {
        const bookingEnd = new Date(booking.scheduledAt.getTime() + booking.duration * 60 * 1000);
        const slotEnd = new Date(slot.getTime() + duration * 60 * 1000);

        return (
          (slot >= booking.scheduledAt && slot < bookingEnd) ||
          (slotEnd > booking.scheduledAt && slotEnd <= bookingEnd) ||
          (slot <= booking.scheduledAt && slotEnd >= bookingEnd)
        );
      });

      if (!hasConflict) {
        availableSlots.push(slot);
      }
    }
  }

  return availableSlots;
};
