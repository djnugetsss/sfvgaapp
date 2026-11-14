/**
 * Comparators for collections that carry an explicit display order.
 *
 * Shared by both repositories so the JSON and Firestore paths cannot sort the
 * same collection two different ways.
 */

export const byOrder = <T extends { order: number }>(a: T, b: T): number =>
  a.order - b.order;

export const byRoleOrder = <T extends { roleOrder: number }>(a: T, b: T): number =>
  a.roleOrder - b.roleOrder;
