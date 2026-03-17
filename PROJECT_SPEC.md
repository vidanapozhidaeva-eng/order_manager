# Order Manager App

## Goal
Simple order management system with realtime sync between devices.

## Stack
Next.js
Supabase
Tailwind
Typescript

## Main Logic

The app manages orders for a small business.

Orders have statuses:

accepted
assembled
delivery
completed

If order type is pickup:
accepted → assembled → completed

If order type is delivery:
accepted → assembled → delivery → completed

## Main Screen

Three main sections:

Today
Tomorrow
All

Orders are automatically placed in these sections based on ready_time.

## Sorting

Orders are sorted by ready_time from earliest to latest.

## Order Card (collapsed)

Show:

- order number
- first 2 lines of description
- order type (delivery or pickup)
- ready time

Cards must be collapsible.

## Order Card (expanded)

Show:

- full description
- image
- status
- ready time

## Status Change

Each order has a button:

Next Status

Status transitions:

accepted → assembled → delivery → completed

Pickup orders skip delivery.

## Create Order Screen

Fields:

Order Type
delivery / pickup

Ready Time
datetime picker

Description
textarea

Photo
image upload

Button
Create Order

## Order Numbers

Numbers go from 1 to 200.

After 200 the counter resets to 1.

## Completed Orders

Completed orders move to a Completed section and stay stored in history.

## Realtime

Orders must sync between devices using Supabase realtime.