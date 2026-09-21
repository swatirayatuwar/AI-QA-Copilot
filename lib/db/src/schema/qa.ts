import { createInsertSchema } from "drizzle-zod";
import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};

export const projectsTable = pgTable("qa_projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  description: text("description").notNull(),
  applicationType: text("application_type").notNull(),
  platform: text("platform").notNull(),
  environment: text("environment").notNull(),
  stack: text("stack").notNull().default(""),
  repository: text("repository"),
  requirements: integer("requirements").notNull().default(0),
  testCases: integer("test_cases").notNull().default(0),
  coverage: integer("coverage").notNull().default(0),
  status: text("status").notNull().default("Active"),
  ...timestamps,
});

export const requirementsTable = pgTable("qa_requirements", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  key: text("key").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  risk: text("risk").notNull(),
  coverage: integer("coverage").notNull().default(0),
  linkedTestCases: integer("linked_test_cases").notNull().default(0),
  acceptanceCriteria: text("acceptance_criteria").array().notNull().default([]),
  createdBy: text("created_by").notNull().default("Alex Morgan"),
  ...timestamps,
});

export const scenariosTable = pgTable("qa_scenarios", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  key: text("key").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  risk: text("risk").notNull(),
  priority: text("priority").notNull(),
  requirement: text("requirement").notNull(),
  testType: text("test_type").notNull(),
  status: text("status").notNull().default("Draft"),
  ...timestamps,
});

export const testCasesTable = pgTable("qa_test_cases", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  key: text("key").notNull(),
  title: text("title").notNull(),
  requirement: text("requirement").notNull(),
  scenario: text("scenario").notNull().default(""),
  module: text("module").notNull(),
  preconditions: text("preconditions").notNull().default(""),
  testData: text("test_data").notNull().default("Synthetic device fixture"),
  steps: text("steps").array().notNull().default([]),
  expectedResult: text("expected_result").notNull().default(""),
  priority: text("priority").notNull(),
  severity: text("severity").notNull(),
  testType: text("test_type").notNull(),
  automationStatus: text("automation_status").notNull().default("Manual"),
  status: text("status").notNull().default("Draft"),
  tags: text("tags").array().notNull().default([]),
  ...timestamps,
});

export const defectsTable = pgTable("qa_defects", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  key: text("key").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirement: text("requirement"),
  testCase: text("test_case"),
  environment: text("environment").notNull(),
  build: text("build").notNull(),
  severity: text("severity").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  assignee: text("assignee").notNull().default("Unassigned"),
  reporter: text("reporter").notNull().default("Alex Morgan"),
  ...timestamps,
});

export const activityTable = pgTable("qa_activity", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  subject: text("subject").notNull(),
  actor: text("actor").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  category: text("category").notNull(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ createdAt: true, updatedAt: true });
export const insertRequirementSchema = createInsertSchema(requirementsTable).omit({ createdAt: true, updatedAt: true });
export const insertScenarioSchema = createInsertSchema(scenariosTable).omit({ createdAt: true, updatedAt: true });
export const insertTestCaseSchema = createInsertSchema(testCasesTable).omit({ createdAt: true, updatedAt: true });
export const insertDefectSchema = createInsertSchema(defectsTable).omit({ createdAt: true, updatedAt: true });
export const insertActivitySchema = createInsertSchema(activityTable).omit({ timestamp: true });

export type Project = typeof projectsTable.$inferSelect;
export type Requirement = typeof requirementsTable.$inferSelect;
export type Scenario = typeof scenariosTable.$inferSelect;
export type TestCase = typeof testCasesTable.$inferSelect;
export type Defect = typeof defectsTable.$inferSelect;
export type ActivityItem = typeof activityTable.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type InsertDefect = z.infer<typeof insertDefectSchema>;