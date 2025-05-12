import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { leaseClauses } from "./seeders/lease-clauses";
import { leaseRules } from "./seeders/lease-rules";

const prisma = new PrismaClient();
const { hash } = bcrypt;

async function main() {
  console.log("Starting to seed database...");

  // --- ADMIN USER ---
  const adminPassword = await hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@leasetracker.com",
      password: adminPassword,
      isActive: true,
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", adminUser.email);

  // --- REGION 219 (Local) ---
  // Landlord: Maximiliano Tec Cocom
  const maxPassword = await hash("password123", 10);
  const maxUser = await prisma.user.create({
    data: {
      name: "Maximiliano Tec Cocom",
      email: "max.tec92@hotmail.com",
      password: maxPassword,
      isActive: true,
      role: "LANDLORD",
      landlord: {
        create: {
          companyName: null,
          phone: "9983991762",
          address: "Region 102, Mz. 88 Lote 27, Cancun, Q. Roo, C.P 77538",
        },
      },
    },
  });
  console.log("Created landlord user:", maxUser.email);

  // Property: Region 219 (Local)
  const maxLandlord = await prisma.landlord.findFirst({
    where: { userId: maxUser.id },
  });
  const region219 = await prisma.property.create({
    data: {
      landlordId: maxLandlord!.id,
      name: "Region 219 (Local)",
      address: "Region 219, Mz. 27 Lote 14, Cancun, Q. Roo, C.P 77517",
      type: "COMMERCIAL",
    },
  });
  console.log("Created property:", region219.name);

  // Unit for Region 219
  const region219Unit = await prisma.unit.create({
    data: {
      propertyId: region219.id,
      unitNumber: "1",
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 150,
    },
  });
  console.log("Created unit:", region219Unit.unitNumber);

  // Tenant: Jose Luis Tec Cocom
//   const joseLuisPassword = await hash("password123", 10);
//   const joseLuisUser = await prisma.user.create({
//     data: {
//       name: "Jose Luis Tec Cocom",
//       email: "ventas.guine@gmail.com",
//       password: null,
//       isActive: false,
//       role: "TENANT",
//       tenant: {
//         create: {
//           phone: "9982225973",
//           emergencyContact: null,
//         },
//       },
//     },
//   });
//   console.log("Created tenant user:", joseLuisUser.email);

  // --- TEKOM YUCATAN (Tienda) ---
  // Landlord: Jose Javier Tec y Chulim
  const javierPassword = await hash("password123", 10);
  const javierUser = await prisma.user.create({
    data: {
      name: "Jose Javier Tec y Chulim",
      email: "imp_sanjose@hotmail.com",
      password: javierPassword,
      isActive: true,
      role: "LANDLORD",
      landlord: {
        create: {
          companyName: null,
          phone: "9983991762",
          address: "Region 102, Mz. 88 Lote 27, Cancun, Q. Roo, C.P 77538",
        },
      },
    },
  });
  console.log("Created landlord user:", javierUser.email);

  // Property: Tekom Yucatan (Tienda)
  const javierLandlord = await prisma.landlord.findFirst({
    where: { userId: javierUser.id },
  });
  const tekomYucatan = await prisma.property.create({
    data: {
      landlordId: javierLandlord!.id,
      name: "Tekom Yucatan (Tienda)",
      address: "59 C. 15, Tekom, Yucatan",
      type: "COMMERCIAL",
    },
  });
  console.log("Created property:", tekomYucatan.name);

  // Unit for Tekom Yucatan
  const tekomUnit = await prisma.unit.create({
    data: {
      propertyId: tekomYucatan.id,
      unitNumber: "1",
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 50,
    },
  });
  console.log("Created unit:", tekomUnit.unitNumber);

  // Tenant: Cosme Fulanito
//   const cosmePassword = await hash("password123", 10);
//   const cosmeUser = await prisma.user.create({
//     data: {
//       name: "Cosme Fulanito",
//       email: "fulanito@gmail.com",
//       password: cosmePassword,
//       isActive: true,
//       role: "TENANT",
//       tenant: {
//         create: {
//           phone: "9982225973",
//           emergencyContact: null,
//         },
//       },
//     },
//   });
//   console.log("Created tenant user:", cosmeUser.email);

  // Seed lease clauses
  console.log("Seeding lease clauses...");
  for (const clause of leaseClauses) {
    await prisma.leaseClause.create({
      data: clause,
    });
  }

  // Seed lease rules
  console.log("Seeding lease rules...");
  for (const rule of leaseRules) {
    await prisma.leaseRule.create({
      data: rule,
    });
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
