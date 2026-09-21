import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import {
  CreateDefectBody,
  CreateDefectResponse,
  CreateProjectBody,
  CreateProjectResponse,
  CreateRequirementBody,
  CreateRequirementResponse,
  CreateScenarioBody,
  CreateScenarioResponse,
  CreateTestCaseBody,
  CreateTestCaseResponse,
  GetDashboardResponse,
  ListActivityResponse,
  ListDefectsQueryParams,
  ListDefectsResponse,
  ListProjectsResponse,
  ListRequirementsQueryParams,
  ListRequirementsResponse,
  ListScenariosQueryParams,
  ListScenariosResponse,
  ListTestCasesQueryParams,
  ListTestCasesResponse,
} from "@workspace/api-zod";
import type {
  ActivityItem,
  Defect,
  Project,
  Requirement,
  Scenario,
  TestCase,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  activityTable,
  defectsTable,
  projectsTable,
  requirementsTable,
  scenariosTable,
  testCasesTable,
} from "@workspace/db";

const router: IRouter = Router();
let seedPromise: Promise<void> | undefined;

const iso = (date: Date | null | undefined) => (date ? date.toISOString() : new Date().toISOString());

const seedDemoData = async () => {
  const [{ value }] = await db.select({ value: count() }).from(projectsTable);
  if (Number(value) > 0) return;

  const projectId = "proj-smart-home";
  const now = new Date();
  await db.insert(projectsTable).values({
    id: projectId,
    name: "Smart Home IoT Platform",
    key: "HOME",
    description: "Mobile application used to pair and manage smart home devices.",
    applicationType: "Mobile",
    platform: "iOS · Android",
    environment: "Staging",
    stack: "React Native · Bluetooth LE",
    repository: null,
    requirements: 8,
    testCases: 24,
    coverage: 78,
    status: "Active",
  });
  await db.insert(requirementsTable).values([
    {
      id: "req-pair-device",
      projectId,
      key: "HOME-101",
      title: "Pair a smart device over Bluetooth",
      description: "Users should be able to pair a smart device with the mobile application using Bluetooth and view the device connection status.",
      priority: "P0",
      status: "In Testing",
      risk: "High",
      coverage: 86,
      linkedTestCases: 6,
      acceptanceCriteria: [
        "Available devices are discoverable within 30 seconds.",
        "The connection status is visible after pairing.",
        "A clear recovery path is available when pairing fails.",
      ],
      createdBy: "Alex Morgan",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "req-device-status",
      projectId,
      key: "HOME-102",
      title: "Show device connection status",
      description: "The application should show whether a paired device is online, offline, or reconnecting.",
      priority: "P1",
      status: "Ready for QA",
      risk: "Medium",
      coverage: 72,
      linkedTestCases: 4,
      acceptanceCriteria: ["Status updates without a manual refresh.", "Offline devices show the last known timestamp."],
      createdBy: "Priya Shah",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "req-firmware",
      projectId,
      key: "HOME-103",
      title: "Notify users about firmware updates",
      description: "Users should be notified when a paired device needs a firmware update.",
      priority: "P2",
      status: "Draft",
      risk: "Low",
      coverage: 33,
      linkedTestCases: 2,
      acceptanceCriteria: ["A notification identifies the affected device.", "The update can be deferred."],
      createdBy: "Jordan Lee",
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await db.insert(scenariosTable).values([
    {
      id: "scn-discover",
      projectId,
      key: "SCN-201",
      title: "Discover a nearby device",
      description: "Verify that a powered-on device appears in the pairing flow.",
      risk: "High",
      priority: "P0",
      requirement: "HOME-101",
      testType: "Functional",
      status: "Ready",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "scn-pair-failure",
      projectId,
      key: "SCN-202",
      title: "Recover from a failed pairing attempt",
      description: "Verify that users can retry pairing after a timeout or rejected Bluetooth permission.",
      risk: "High",
      priority: "P0",
      requirement: "HOME-101",
      testType: "Negative",
      status: "Ready",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "scn-offline",
      projectId,
      key: "SCN-203",
      title: "Display an offline device",
      description: "Verify offline state and last-seen timestamp for an unavailable device.",
      risk: "Medium",
      priority: "P1",
      requirement: "HOME-102",
      testType: "Integration",
      status: "Draft",
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await db.insert(testCasesTable).values([
    {
      id: "tc-pair-happy",
      projectId,
      key: "TC-301",
      title: "Pair an available device successfully",
      requirement: "HOME-101",
      scenario: "SCN-201",
      module: "Pairing",
      preconditions: "Bluetooth is enabled and a synthetic device fixture is advertising.",
      testData: "fixture-lamp-001",
      steps: ["Open Devices", "Tap Add device", "Select fixture-lamp-001", "Confirm pairing code"],
      expectedResult: "The device is paired and shows Connected.",
      priority: "P0",
      severity: "Critical",
      testType: "Functional",
      automationStatus: "Automated",
      status: "Approved",
      tags: ["bluetooth", "smoke"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tc-pair-timeout",
      projectId,
      key: "TC-302",
      title: "Retry pairing after a connection timeout",
      requirement: "HOME-101",
      scenario: "SCN-202",
      module: "Pairing",
      preconditions: "Bluetooth is enabled and the fixture does not respond.",
      testData: "fixture-timeout-001",
      steps: ["Start pairing", "Wait for timeout", "Tap Try again"],
      expectedResult: "The timeout is explained and the user can retry.",
      priority: "P0",
      severity: "Major",
      testType: "Negative",
      automationStatus: "Candidate",
      status: "Ready",
      tags: ["bluetooth", "recovery"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tc-offline-status",
      projectId,
      key: "TC-303",
      title: "Show last-seen time for an offline device",
      requirement: "HOME-102",
      scenario: "SCN-203",
      module: "Device status",
      preconditions: "A paired fixture has gone offline.",
      testData: "fixture-offline-001",
      steps: ["Open Devices", "Select the offline fixture"],
      expectedResult: "The device shows Offline and the last-seen timestamp.",
      priority: "P1",
      severity: "Major",
      testType: "Integration",
      automationStatus: "Manual",
      status: "Draft",
      tags: ["status", "offline"],
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await db.insert(defectsTable).values([
    {
      id: "defect-pairing-timeout",
      projectId,
      key: "BUG-417",
      title: "Pairing spinner does not resolve after Bluetooth timeout",
      description: "The pairing flow remains in a loading state when the peripheral stops responding.",
      requirement: "HOME-101",
      testCase: "TC-302",
      environment: "Staging",
      build: "2.8.0-rc.4",
      severity: "Critical",
      priority: "P0",
      status: "In Progress",
      assignee: "Priya Shah",
      reporter: "Alex Morgan",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "defect-status-delay",
      projectId,
      key: "BUG-412",
      title: "Device status takes 20 seconds to show offline",
      description: "The status card remains Connected after the fixture has stopped advertising.",
      requirement: "HOME-102",
      testCase: "TC-303",
      environment: "Staging",
      build: "2.8.0-rc.4",
      severity: "Major",
      priority: "P1",
      status: "Open",
      assignee: "Unassigned",
      reporter: "Jordan Lee",
      createdAt: now,
      updatedAt: now,
    },
  ]);
  await db.insert(activityTable).values([
    { id: "act-1", action: "approved", subject: "TC-301 Pair an available device successfully", actor: "Priya Shah", timestamp: now, category: "Test case" },
    { id: "act-2", action: "updated", subject: "HOME-101 Pair a smart device over Bluetooth", actor: "Alex Morgan", timestamp: new Date(now.getTime() - 1000 * 60 * 24), category: "Requirement" },
    { id: "act-3", action: "created", subject: "BUG-417 Pairing spinner does not resolve", actor: "Alex Morgan", timestamp: new Date(now.getTime() - 1000 * 60 * 42), category: "Defect" },
    { id: "act-4", action: "generated", subject: "4 test scenarios from HOME-101", actor: "Demo AI", timestamp: new Date(now.getTime() - 1000 * 60 * 90), category: "AI suggestion" },
  ]);
};

const ensureSeed = async () => {
  seedPromise ??= seedDemoData();
  await seedPromise;
};

const toProject = (project: typeof projectsTable.$inferSelect): Project => ({
  ...project,
  updatedAt: iso(project.updatedAt),
});

const toRequirement = (item: typeof requirementsTable.$inferSelect): Requirement => ({
  ...item,
  updatedAt: iso(item.updatedAt),
});

const toScenario = (item: typeof scenariosTable.$inferSelect): Scenario => ({
  id: item.id,
  key: item.key,
  title: item.title,
  description: item.description,
  risk: item.risk,
  priority: item.priority,
  requirement: item.requirement,
  testType: item.testType,
  status: item.status,
});

const toTestCase = (item: typeof testCasesTable.$inferSelect): TestCase => ({
  id: item.id,
  key: item.key,
  title: item.title,
  requirement: item.requirement,
  scenario: item.scenario,
  module: item.module,
  preconditions: item.preconditions,
  testData: item.testData,
  steps: item.steps,
  expectedResult: item.expectedResult,
  priority: item.priority,
  severity: item.severity,
  testType: item.testType,
  automationStatus: item.automationStatus,
  status: item.status,
  tags: item.tags,
});

const toDefect = (item: typeof defectsTable.$inferSelect): Defect => ({
  ...item,
  createdAt: iso(item.createdAt),
  updatedAt: iso(item.updatedAt),
});

const toActivity = (item: typeof activityTable.$inferSelect): ActivityItem => ({
  ...item,
  timestamp: iso(item.timestamp),
});

router.get("/dashboard", async (_req, res) => {
  await ensureSeed();
  const [requirements, testCases, defects] = await Promise.all([
    db.select().from(requirementsTable),
    db.select().from(testCasesTable),
    db.select().from(defectsTable),
  ]);
  const automated = testCases.filter((item) => item.automationStatus === "Automated").length;
  const openDefects = defects.filter((item) => !["Closed", "Rejected"].includes(item.status)).length;
  const criticalDefects = defects.filter((item) => ["Blocker", "Critical"].includes(item.severity) && item.status !== "Closed").length;
  const data = {
    metrics: {
      requirements: requirements.length + 5,
      testCases: testCases.length + 21,
      automationCoverage: 64,
      passRate: 84,
      openDefects: openDefects + 7,
      criticalDefects: criticalDefects + 1,
    },
    coverage: [
      { label: "Mon", value: 62 },
      { label: "Tue", value: 68 },
      { label: "Wed", value: 71 },
      { label: "Thu", value: 74 },
      { label: "Fri", value: 78 },
      { label: "Sat", value: 78 },
      { label: "Sun", value: 82 },
    ],
    executionTrend: [
      { label: "Mon", value: 71, secondary: 12 },
      { label: "Tue", value: 78, secondary: 9 },
      { label: "Wed", value: 76, secondary: 14 },
      { label: "Thu", value: 84, secondary: 7 },
      { label: "Fri", value: 89, secondary: 5 },
      { label: "Sat", value: 86, secondary: 8 },
      { label: "Sun", value: 91, secondary: 4 },
    ],
    defects: [
      { label: "Mon", value: 13 },
      { label: "Tue", value: 11 },
      { label: "Wed", value: 12 },
      { label: "Thu", value: 9 },
      { label: "Fri", value: 8 },
      { label: "Sat", value: 8 },
      { label: "Sun", value: 7 },
    ],
    recommendations: [
      { id: "rec-1", title: "Complete acceptance criteria", detail: "3 requirements have incomplete acceptance criteria.", severity: "High" },
      { id: "rec-2", title: "Close traceability gaps", detail: "12 test cases are not linked to a requirement.", severity: "Medium" },
      { id: "rec-3", title: "Cover high-risk scenarios", detail: "5 high-risk scenarios have no automation coverage.", severity: "High" },
    ],
  };
  res.json(GetDashboardResponse.parse(data));
});

router.get("/projects", async (_req, res) => {
  await ensureSeed();
  const data = await db.select().from(projectsTable).orderBy(desc(projectsTable.updatedAt));
  res.json(ListProjectsResponse.parse(data.map(toProject)));
});

router.post("/projects", async (req, res) => {
  await ensureSeed();
  const body = CreateProjectBody.parse(req.body);
  const id = `proj-${randomUUID().slice(0, 8)}`;
  const created = await db.insert(projectsTable).values({
    id,
    name: body.name,
    key: body.key.toUpperCase(),
    description: body.description,
    applicationType: body.applicationType,
    platform: body.platform,
    environment: body.environment,
    stack: body.stack ?? "",
    repository: null,
    requirements: 0,
    testCases: 0,
    coverage: 0,
    status: "Active",
  }).returning();
  res.status(201).json(CreateProjectResponse.parse(toProject(created[0])));
});

router.get("/requirements", async (req, res) => {
  await ensureSeed();
  const query = ListRequirementsQueryParams.parse(req.query);
  const filters = [];
  if (query.projectId) filters.push(eq(requirementsTable.projectId, query.projectId));
  if (query.status) filters.push(eq(requirementsTable.status, query.status));
  if (query.search) filters.push(ilike(requirementsTable.title, `%${query.search}%`));
  const data = await db.select().from(requirementsTable).where(filters.length ? and(...filters) : undefined).orderBy(desc(requirementsTable.updatedAt));
  res.json(ListRequirementsResponse.parse(data.map(toRequirement)));
});

router.post("/requirements", async (req, res) => {
  await ensureSeed();
  const body = CreateRequirementBody.parse(req.body);
  const now = new Date();
  const created = await db.insert(requirementsTable).values({
    id: `req-${randomUUID().slice(0, 8)}`,
    projectId: body.projectId,
    key: `REQ-${Math.floor(100 + Math.random() * 899)}`,
    title: body.title,
    description: body.description,
    priority: body.priority,
    status: body.status,
    risk: body.risk,
    coverage: 0,
    linkedTestCases: 0,
    acceptanceCriteria: [],
    createdBy: "Alex Morgan",
    createdAt: now,
    updatedAt: now,
  }).returning();
  res.status(201).json(CreateRequirementResponse.parse(toRequirement(created[0])));
});

router.get("/test-design/scenarios", async (req, res) => {
  await ensureSeed();
  const query = ListScenariosQueryParams.parse(req.query);
  const data = await db.select().from(scenariosTable)
    .where(query.projectId ? eq(scenariosTable.projectId, query.projectId) : undefined)
    .orderBy(desc(scenariosTable.updatedAt));
  res.json(ListScenariosResponse.parse(data.map(toScenario)));
});

router.post("/test-design/scenarios", async (req, res) => {
  await ensureSeed();
  const body = CreateScenarioBody.parse(req.body);
  const now = new Date();
  const created = await db.insert(scenariosTable).values({
    id: `scn-${randomUUID().slice(0, 8)}`,
    projectId: body.projectId,
    key: `SCN-${Math.floor(100 + Math.random() * 899)}`,
    title: body.title,
    description: body.description,
    risk: body.risk,
    priority: body.priority,
    requirement: body.requirement,
    testType: body.testType,
    status: "Draft",
    createdAt: now,
    updatedAt: now,
  }).returning();
  res.status(201).json(CreateScenarioResponse.parse(toScenario(created[0])));
});

router.get("/test-cases", async (req, res) => {
  await ensureSeed();
  const query = ListTestCasesQueryParams.parse(req.query);
  const filters = [];
  if (query.projectId) filters.push(eq(testCasesTable.projectId, query.projectId));
  if (query.automationStatus) filters.push(eq(testCasesTable.automationStatus, query.automationStatus));
  if (query.search) filters.push(ilike(testCasesTable.title, `%${query.search}%`));
  const data = await db.select().from(testCasesTable).where(filters.length ? and(...filters) : undefined).orderBy(desc(testCasesTable.updatedAt));
  res.json(ListTestCasesResponse.parse(data.map(toTestCase)));
});

router.post("/test-cases", async (req, res) => {
  await ensureSeed();
  const body = CreateTestCaseBody.parse(req.body);
  const now = new Date();
  const created = await db.insert(testCasesTable).values({
    id: `tc-${randomUUID().slice(0, 8)}`,
    projectId: body.projectId,
    key: `TC-${Math.floor(100 + Math.random() * 899)}`,
    title: body.title,
    requirement: body.requirement,
    scenario: body.scenario ?? "",
    module: body.module,
    priority: body.priority,
    severity: body.severity,
    testType: body.testType,
    createdAt: now,
    updatedAt: now,
  }).returning();
  res.status(201).json(CreateTestCaseResponse.parse(toTestCase(created[0])));
});

router.get("/defects", async (req, res) => {
  await ensureSeed();
  const query = ListDefectsQueryParams.parse(req.query);
  const filters = [];
  if (query.projectId) filters.push(eq(defectsTable.projectId, query.projectId));
  if (query.status) filters.push(eq(defectsTable.status, query.status));
  const data = await db.select().from(defectsTable).where(filters.length ? and(...filters) : undefined).orderBy(desc(defectsTable.updatedAt));
  res.json(ListDefectsResponse.parse(data.map(toDefect)));
});

router.post("/defects", async (req, res) => {
  await ensureSeed();
  const body = CreateDefectBody.parse(req.body);
  const now = new Date();
  const created = await db.insert(defectsTable).values({
    id: `defect-${randomUUID().slice(0, 8)}`,
    projectId: body.projectId,
    key: `BUG-${Math.floor(100 + Math.random() * 899)}`,
    title: body.title,
    description: body.description,
    requirement: null,
    testCase: null,
    environment: body.environment,
    build: body.build,
    severity: body.severity,
    priority: body.priority,
    status: "New",
    assignee: body.assignee ?? "Unassigned",
    reporter: "Alex Morgan",
    createdAt: now,
    updatedAt: now,
  }).returning();
  res.status(201).json(CreateDefectResponse.parse(toDefect(created[0])));
});

router.get("/activity", async (_req, res) => {
  await ensureSeed();
  const data = await db.select().from(activityTable).orderBy(desc(activityTable.timestamp));
  res.json(ListActivityResponse.parse(data.map(toActivity)));
});

export default router;