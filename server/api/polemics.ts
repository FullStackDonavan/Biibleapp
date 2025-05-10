import prisma from "~/server/database/client";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const category = query.category;

    if (!category) {
      // If no category is provided, return the list of categories
      const polemics = await prisma.polemics.findMany({
        select: { category: true },
        distinct: ["category"],
      });

      return {
        success: true,
        categories: polemics.map((p) => p.category),
      };
    }

    // If category is provided, fetch the claims for that category
    const claims = await prisma.polemics.findMany({
      where: { category },
      select: { id: true, claim: true },
    });

    return {
      success: true,
      claims,
    };
  } catch (error) {
    console.error("❌ Error fetching polemics data:", error);
    return { success: false, message: "Server error while fetching polemics." };
  }
});
