BEGIN;

-- 1. Role: giu nguyen ID va ten role
ALTER TABLE "Role" RENAME COLUMN "id" TO "roleid";
ALTER TABLE "Role" RENAME COLUMN "name" TO "rolename";

ALTER TABLE "Role"
  ALTER COLUMN "rolename" TYPE VARCHAR(50);

ALTER INDEX "Role_name_key" RENAME TO "Role_rolename_key";
ALTER SEQUENCE "Role_id_seq" RENAME TO "Role_roleid_seq";


-- 2. MemberShip: giu nguyen ID va score
ALTER TABLE "MemberShip" RENAME COLUMN "id" TO "mid";

ALTER TABLE "MemberShip"
  ADD COLUMN "mname" VARCHAR(50);

UPDATE "MemberShip"
SET "mname" = 'normal';

ALTER TABLE "MemberShip"
  ALTER COLUMN "mname" SET NOT NULL;

ALTER SEQUENCE "MemberShip_id_seq"
  RENAME TO "MemberShip_mid_seq";


-- 3. User: doi ten cot va chuyen lien ket membership
ALTER TABLE "User" RENAME COLUMN "id" TO "uid";
ALTER TABLE "User" RENAME COLUMN "roleId" TO "roleid";

ALTER TABLE "User"
  ADD COLUMN "fullname" VARCHAR(100),
  ADD COLUMN "mid" INTEGER;

-- Database cu chua co ho ten: tam lay username
UPDATE "User"
SET "fullname" = "username";

-- Giu dung membership cua tung user cu
UPDATE "User" AS u
SET "mid" = m."mid"
FROM "MemberShip" AS m
WHERE m."userId" = u."uid";

ALTER TABLE "User"
  ALTER COLUMN "fullname" SET NOT NULL,
  ALTER COLUMN "mid" SET NOT NULL,
  ALTER COLUMN "username" TYPE VARCHAR(50),
  ALTER COLUMN "password" TYPE VARCHAR(255);

ALTER TABLE "User"
  RENAME CONSTRAINT "User_roleId_fkey" TO "User_roleid_fkey";

ALTER TABLE "User"
  ADD CONSTRAINT "User_mid_fkey"
  FOREIGN KEY ("mid") REFERENCES "MemberShip"("mid")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Bo lien ket cu sau khi da chuyen sang User.mid
ALTER TABLE "MemberShip"
  DROP CONSTRAINT "MemberShip_userId_fkey";

DROP INDEX "MemberShip_userId_key";

ALTER TABLE "MemberShip"
  DROP COLUMN "userId";

-- Cac cot ngoai so do de; du lieu cu nam trong backup
ALTER TABLE "User"
  DROP COLUMN "email",
  DROP COLUMN "createdAt";

ALTER SEQUENCE "User_id_seq" RENAME TO "User_uid_seq";


-- 4. Product: giu nguyen san pham, gia va ton kho
ALTER TABLE "Product" RENAME COLUMN "id" TO "pid";
ALTER TABLE "Product" RENAME COLUMN "name" TO "pname";

ALTER TABLE "Product"
  ALTER COLUMN "pname" TYPE VARCHAR(100),
  ALTER COLUMN "price" TYPE DECIMAL(10,2);

ALTER SEQUENCE "Product_id_seq" RENAME TO "Product_pid_seq";


-- 5. Order: giu nguyen ID, chu don va thoi gian dat
ALTER TABLE "Order" RENAME COLUMN "id" TO "oid";
ALTER TABLE "Order" RENAME COLUMN "userId" TO "uid";
ALTER TABLE "Order" RENAME COLUMN "orderDate" TO "createat";

ALTER TABLE "Order"
  RENAME CONSTRAINT "Order_userId_fkey" TO "Order_uid_fkey";

ALTER TABLE "Order"
  DROP COLUMN "total",
  DROP COLUMN "status";

ALTER SEQUENCE "Order_id_seq" RENAME TO "Order_oid_seq";


-- 6. OrderDetail: giu du lieu, chuyen sang khoa chinh ghep
ALTER TABLE "OrderDetail" RENAME COLUMN "orderId" TO "oid";
ALTER TABLE "OrderDetail" RENAME COLUMN "productId" TO "pid";
ALTER TABLE "OrderDetail" RENAME COLUMN "quantity" TO "qty";
ALTER TABLE "OrderDetail" RENAME COLUMN "price" TO "unit_price";

ALTER TABLE "OrderDetail"
  ALTER COLUMN "unit_price" TYPE DECIMAL(10,2);

ALTER TABLE "OrderDetail"
  DROP CONSTRAINT "OrderDetail_pkey";

ALTER TABLE "OrderDetail"
  ADD CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("oid", "pid");

ALTER TABLE "OrderDetail"
  DROP COLUMN "id";

ALTER TABLE "OrderDetail"
  RENAME CONSTRAINT "OrderDetail_orderId_fkey"
  TO "OrderDetail_oid_fkey";

ALTER TABLE "OrderDetail"
  RENAME CONSTRAINT "OrderDetail_productId_fkey"
  TO "OrderDetail_pid_fkey";


-- 7. Shipment: cho phep nhieu shipment tren mot don
ALTER TABLE "Shipment" RENAME COLUMN "id" TO "shipid";
ALTER TABLE "Shipment" RENAME COLUMN "orderId" TO "oid";

DROP INDEX "Shipment_orderId_key";

ALTER TABLE "Shipment"
  ALTER COLUMN "status" TYPE VARCHAR(50),
  DROP COLUMN "shipmentDate";

ALTER TABLE "Shipment"
  RENAME CONSTRAINT "Shipment_orderId_fkey"
  TO "Shipment_oid_fkey";

ALTER SEQUENCE "Shipment_id_seq"
  RENAME TO "Shipment_shipid_seq";

COMMIT;