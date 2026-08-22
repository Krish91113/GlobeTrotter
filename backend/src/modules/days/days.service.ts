import prisma from "../../lib/prisma";
import { getOwnedTripOrThrow } from "../trips/trips.service";
import { type TripDayDto, toTripDayDto } from "./days.dto";

export async function getTripDays(
  tripId: string,
  userId: string,
): Promise<TripDayDto[]> {
  await getOwnedTripOrThrow(tripId, userId);

  const days = await prisma.tripDay.findMany({
    where: { tripId },
    include: {
      tripStop: {
        include: {
          location: { select: { id: true, name: true } },
        },
      },
      itineraryItems: {
        include: {
          catalogItem: {
            select: {
              id: true,
              name: true,
              categories: {
                select: { category: { select: { displayName: true } } },
              },
              media: { select: { thumbnailUri: true }, take: 1 },
            },
          },
          currency: { select: { isoCode: true } },
        },
        orderBy: { sequenceNo: "asc" },
      },
    },
    orderBy: { dayNumber: "asc" },
  });

  return days.map(toTripDayDto);
}
