# 📚 EVO MICROSERVICE API - ARCHITECTURE & DETAILED PROCESSING FLOW

> **System architecture analysis document for EVO Microservice API**  
> Microservices system for online public services with CQRS + Event Sourcing  
> Version: 1.0  
> Last Updated: 2024

---

## 📖 TABLE OF CONTENTS

- [1. SYSTEM OVERVIEW](#1-system-overview)
- [2. MICROSERVICES ARCHITECTURE](#2-microservices-architecture)
- [3. TECHNOLOGY STACK](#3-technology-stack)
- [4. CQRS + EVENT SOURCING PATTERN](#4-cqrs--event-sourcing-pattern)
- [5. INTER-SERVICE COMMUNICATION](#5-inter-service-communication)
- [6. DOSSIER CREATION FLOW (WRITE FLOW)](#6-dossier-creation-flow-write-flow)
- [7. LIST RETRIEVAL FLOW (READ FLOW)](#7-list-retrieval-flow-read-flow)
- [8. DATABASE DESIGN](#8-database-design)
- [9. API DESIGN PATTERNS](#9-api-design-patterns)
- [10. BEST PRACTICES](#10-best-practices)

---

## 1. SYSTEM OVERVIEW

### 1.1. Introduction

**EVO Microservice API** is a backend microservices system serving **Mobifone's online public services**, built with modern technologies:

- **Framework**: NestJS 11.x (Node.js)
- **Language**: TypeScript 5.8
- **Architecture**: CQRS + Event Sourcing
- **Database**: MySQL 8.0 (Command & Query)
- **Message Broker**: NATS
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)

### 1.2. System Overview Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
        ADMIN[Admin Portal]
    end
    
    subgraph "API Gateway"
        GATEWAY[Gateway Service]
    end
    
    subgraph "Microservices"
        AUTH[Auth Service]
        CONFIG[Configuring Service]
        ORG[Organizing Service]
        SUBMIT[Submitting Service]
        PROCESS[Processing Service]
        RESPOND[Responding Service]
        PROFILE[Profiling Service]
        COORD[Coordinating Service]
    end
    
    subgraph "Infrastructure"
        NATS[NATS Broker]
        MYSQL[(MySQL)]
        REDIS[(Redis)]
        MINIO[MinIO Storage]
    end
    
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    ADMIN --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> CONFIG
    GATEWAY --> ORG
    GATEWAY --> SUBMIT
    GATEWAY --> PROCESS
    GATEWAY --> RESPOND
    GATEWAY --> PROFILE
    GATEWAY --> COORD
    
    AUTH -.-> NATS
    CONFIG -.-> NATS
    ORG -.-> NATS
    SUBMIT -.-> NATS
    PROCESS -.-> NATS
    RESPOND -.-> NATS
    PROFILE -.-> NATS
    COORD -.-> NATS
    
    AUTH --> MYSQL
    CONFIG --> MYSQL
    ORG --> MYSQL
    SUBMIT --> MYSQL
    PROCESS --> MYSQL
    RESPOND --> MYSQL
    PROFILE --> MYSQL
    
    AUTH --> REDIS
    CONFIG --> REDIS
    ORG --> REDIS
    SUBMIT --> REDIS
    
    SUBMIT --> MINIO
    RESPOND --> MINIO
```

---

## 2. MICROSERVICES ARCHITECTURE

### 2.1. Services List

| Service | Port | Function | Database |
|---------|------|----------|----------|
| **auth** | 16201 | Authentication & authorization | MySQL + Redis + CQL |
| **configuring** | 16203 | Procedure & category configuration | MySQL (Command + Query) |
| **organizing** | 16202 | Organization, department, employee management | MySQL + CQL |
| **submitting** | 16206 | Dossier submission from citizens | MySQL + CQL + Redis |
| **processing** | 16207 | Dossier workflow processing | MySQL |
| **responding** | 16204 | Result response to citizens | MySQL |
| **profiling** | 16205 | Citizen profile management | MySQL |
| **coordinating** | 16210 | External system coordination | MySQL + CQL |
| **wrapper** | 16208 | Integration wrapper API | - |
| **gateway** | 16209 | API Gateway (reverse proxy) | - |
| **internal** | - | Workers, background jobs | - |

### 2.2. Service Dependencies

```mermaid
graph LR
    AUTH[Auth Service]
    CONFIG[Configuring]
    ORG[Organizing]
    SUBMIT[Submitting]
    PROCESS[Processing]
    RESPOND[Responding]
    PROFILE[Profiling]
    
    AUTH -->|get employee| ORG
    SUBMIT -->|get formality| CONFIG
    SUBMIT -->|get department| ORG
    SUBMIT -->|create citizen| PROFILE
    PROCESS -->|forward dossier| SUBMIT
    RESPOND -->|update dossier| SUBMIT
    PROFILE -->|get citizen| COORD
```

---

## 3. TECHNOLOGY STACK

### 3.1. Core Technologies

```typescript
{
  "framework": "NestJS 11.1.3",
  "runtime": "Node.js 22+",
  "language": "TypeScript 5.8",
  "httpServer": "Fastify 5.4",
  "packageManager": "pnpm 10.11"
}
```

### 3.2. Database & Storage

```typescript
{
  "primaryDb": "MySQL 8.0",
  "orm": "TypeORM 0.3.25",
  "cache": "Redis",
  "eventStore": "ScyllaDB/Cassandra (CQL)",
  "objectStorage": "MinIO"
}
```

### 3.3. Message Broker

```typescript
{
  "messageBroker": "NATS 2.29",
  "pattern": "Request/Reply + Pub/Sub",
  "serialization": "msgpackr (binary)"
}
```

### 3.4. Monitoring & Observability

```typescript
{
  "tracing": "OpenTelemetry",
  "backend": "Tempo / Jaeger",
  "logging": "Winston",
  "alerting": "Telegram Bot"
}
```

---

## 4. CQRS + EVENT SOURCING PATTERN

### 4.1. CQRS Overview

**CQRS** (Command Query Responsibility Segregation) tách biệt hoàn toàn Write và Read models.

```mermaid
graph TB
    subgraph "Command Side (Write)"
        CMD[Command]
        AGG[Aggregate]
        EVENT[Event]
        ES[(Event Store)]
        
        CMD --> AGG
        AGG --> EVENT
        EVENT --> ES
    end
    
    subgraph "Query Side (Read)"
        PROJ[Projection Handler]
        QM[(Query Model)]
        QUERY[Query]
        
        PROJ --> QM
        QUERY --> QM
    end
    
    ES -.emit.-> PROJ
    
    style CMD fill:#ff9999
    style QUERY fill:#99ccff
```

### 4.2. Command Side (Write)

**Event Store Schema:**

```sql
CREATE TABLE submitting_dossier_events (
    id VARCHAR(36) PRIMARY KEY,              -- UUID v7
    version INT NOT NULL,                    -- Event version
    created_at BIGINT NOT NULL,              -- Timestamp
    event_name VARCHAR(255),                 -- "DossierCreated"
    event_payload JSON,                      -- Event data
    data JSON,                               -- Current state snapshot
    INDEX idx_created_at (created_at)
);
```

**Example Event Record:**

```json
{
  "id": "01927f1c-3e8d-7890-abcd-0242ac120002",
  "version": 1,
  "created_at": 1730000000000,
  "event_name": "DossierCreated",
  "event_payload": {
    "dossierId": "01927f1c-3e8d-7890-abcd-0242ac120002",
    "code": "EVO-001-2024-00001",
    "state": "PENDING_SUBMISSION",
    "applicantName": "John Doe",
    "formalityId": "formality-uuid-001"
  },
  "data": {
    "id": "01927f1c-3e8d-7890-abcd-0242ac120002",
    "code": "EVO-001-2024-00001",
    "state": "PENDING_SUBMISSION",
    "applicantInfo": { "citizen": {...} },
    "formality": { "id": "...", "name": "..." },
    "timeline": { "createdAt": 1730000000000 }
  }
}
```

### 4.3. Query Side (Read)

**Denormalized Table Schema:**

```sql
CREATE TABLE submitting_dossier (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(128) UNIQUE,
    
    -- Denormalized fields for fast query
    department_id VARCHAR(36),
    department_name VARCHAR(256),
    applicant_name VARCHAR(256),
    formality_id VARCHAR(36),
    formality_name VARCHAR(256),
    dossier_source VARCHAR(16),
    dossier_type VARCHAR(16),
    state VARCHAR(64),
    
    -- Timestamps for range queries
    created_at BIGINT,
    submitted_at BIGINT,
    received_at BIGINT,
    
    -- Cache JSON for complex data
    cache JSON,
    
    -- Indexes
    INDEX idx_code (code),
    INDEX idx_department_id (department_id),
    INDEX idx_formality_id (formality_id),
    INDEX idx_state (state),
    INDEX idx_created_at (created_at)
);
```

### 4.4. Event Sourcing Flow

```mermaid
sequenceDiagram
    participant Client
    participant Service
    participant Aggregate
    participant EventStore
    participant EventEmitter
    participant Projection
    participant QueryDB
    
    Client->>Service: Command
    Service->>Aggregate: Create aggregate
    Aggregate->>Service: Return aggregate
    Service->>EventStore: Commit event
    
    Note over EventStore: INSERT event<br/>Cache Redis<br/>Version++
    
    EventStore->>EventEmitter: Emit event
    EventEmitter->>Projection: Handle event
    Projection->>QueryDB: Update query model
    
    Service->>Client: Response (ID)
    
    Note over QueryDB: Denormalized data<br/>ready for fast reads
```

---

## 5. INTER-SERVICE COMMUNICATION

### 5.1. NATS Request/Reply Pattern

```mermaid
sequenceDiagram
    participant ServiceA as Auth Service
    participant NATS as NATS Broker
    participant ServiceB as Organizing Service
    
    ServiceA->>NATS: request("organizing.get-employee", {username})
    Note over NATS: Route to handler
    NATS->>ServiceB: Deliver message
    ServiceB->>ServiceB: Handle request
    ServiceB->>NATS: reply({ok: true, response: {...}})
    NATS->>ServiceA: Deliver response
    
    Note over ServiceA: Check ok flag<br/>Process response
```

### 5.2. Implementation Pattern

**Defining Service Contract** (libs/messaging):

```typescript
// libs/messaging/src/organizing/get-employee-by-ids/index.ts
export abstract class IGetEmployeeByIdsService extends SyncMessage<
    IGetEmployeeByIdsRequest,
    IGetEmployeeByIdsResponse
> {
    static override key = 'organizing.get-employees-by-ids'
    
    static request: ISendSyncRequest<
        IGetEmployeeByIdsRequest,
        IGetEmployeeByIdsResponse
    > = sendSyncRequest.bind(null, IGetEmployeeByIdsService.key)
}
```

**Implementing Reply Handler**:

```typescript
// apps/organizing/src/features/employee/querying/get-employee-by-ids.service.ts
@Injectable()
export class GetEmployeeByIdsService implements OnModuleInit {
    static SERVICE_KEY = 'organizing.get-employees-by-ids'
    
    constructor(
        private readonly communicatorService: CommunicatorService,
        private readonly queryRepo: OrganizingQueryRepo
    ) {}
    
    async onModuleInit() {
        // Register handler when service starts
        await this.communicatorService.reply(
            GetEmployeeByIdsService.SERVICE_KEY,
            async (request: IGetEmployeeByIdsRequest) => {
                return await this.handle(request)
            }
        )
    }
    
    private async handle(request: IGetEmployeeByIdsRequest) {
        const employees = await this.queryRepo.employeeRepo.find({
            where: { id: In(request.employeeIds) }
        })
        
        return { employees }
    }
}
```

**Calling from Another Service**:

```typescript
// apps/auth/src/features/admin-authenticating/sign-in-by-admin.service.ts
const { ok, response } = await IGetEmployeeByIdsService.request(
    this.communicatorService,
    { employeeIds: ['emp-001', 'emp-002'] },
    { timeout: 3000, traceId: ctx.traceId }
)

if (!ok || !response) {
    return throwServerError()
}

// Use response.employees
```

### 5.3. Response Format (Standardized)

```typescript
interface SyncResponse<T> {
    ok: boolean           // Success flag
    response: T | null    // Data payload
    code: string          // Error/Status code
    message: string       // Human-readable message
}
```

---

## 6. DOSSIER CREATION FLOW (WRITE FLOW)

### 6.1. Sequence Diagram - Complete Flow

```mermaid
sequenceDiagram
    actor Citizen
    participant Controller
    participant Service
    participant PrepareData
    participant Redis
    participant NATS
    participant InternalService
    participant EventStore
    participant EventEmitter
    participant Projection
    participant QueryDB
    
    Citizen->>Controller: POST /submitting/create-dossier-by-citizen
    Note over Controller: @GuardCitizen()<br/>Extract JWT
    Controller->>Service: handle(request, citizen)
    
    Service->>Service: validateDossierType()
    Service->>PrepareData: handle(request, citizen)
    
    par Parallel Validation
        PrepareData->>NATS: Get Department
        PrepareData->>NATS: Get Formality
        PrepareData->>NATS: Get Category
    end
    
    PrepareData-->>Service: Validated data
    
    Service->>Redis: Generate dossier code
    Redis-->>Service: EVO-001-2024-00001
    
    Service->>NATS: CreateDossierService.request()
    NATS->>InternalService: Handle create
    
    InternalService->>InternalService: Create aggregate
    InternalService->>InternalService: Create DossierCreated event
    InternalService->>EventStore: Commit event
    
    Note over EventStore: INSERT to MySQL<br/>Cache to Redis<br/>Version = 1
    
    EventStore->>EventEmitter: Emit DossierCreated
    EventEmitter->>Projection: @OnEvent handler
    
    Projection->>QueryDB: Insert denormalized row
    
    InternalService-->>NATS: Response {dossierId}
    NATS-->>Service: {ok: true, response}
    Service-->>Controller: {dossierId}
    Controller-->>Citizen: 200 OK {dossierId}
    
    Note over Projection,QueryDB: Async - doesn't block response
```

### 6.2. Step-by-Step Implementation

#### **Step 1: HTTP Request**

```http
POST /api/v1/submitting/create-dossier-by-citizen HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "applicant": {
    "citizen": {
      "identity": "001234567890",
      "name": "John Doe",
      "phone": "0987654321",
      "email": "johndoe@gmail.com"
    }
  },
  "type": "CITIZEN",
  "formalityId": "formality-uuid-001",
  "formalityCaseId": "case-uuid-001",
  "departmentId": "dept-uuid-001",
  "categoryId": "cat-uuid-001",
  "formJson": "{\"companyName\":\"ABC Corp\"}",
  "profileComponents": [...],
  "fees": [...],
  "returning": "AT_DEPARTMENT",
  "isDraft": false
}
```

#### **Step 2: Controller Layer**

```typescript
@Controller()
@GuardCitizen()  // ✅ Verify JWT + extract citizen
export class CitizenCreatingController {
    @Post('/submitting/create-dossier-by-citizen')
    async createDossierByCitizen(
        @Body() body: CreateDossierByCitizenRequest,  // ✅ DTO validation
        @Citizen() citizen: CitizenInfoDto             // ✅ From JWT
    ) {
        return this.createDossierByCitizenService.handle(body, citizen)
    }
}
```

#### **Step 3: Service Handle**

```typescript
async handle(request, citizen) {
    // ✅ 1. Validate dossier type
    validateDossierType({ user: citizen, dossierType: request.type })
    
    // ✅ 2. Prepare & validate data (parallel calls)
    const data = await this.prepareCreateDossierByCitizenData.handle(request, citizen)
    
    const now = +DayJs()
    
    // ✅ 3. Generate unique dossier code
    const generatedCode = await generateDossierCode({
        departmentId: data.department.id,
        departmentCode: data.department.code,
        dossierCodeRepo: this.dossierCodeRepo,
    })
    // generatedCode = "EVO-001-2024-00001"
    
    // ✅ 4. Generate UUID for dossier
    const dossierId = v7()  // Time-ordered UUID
    
    // ✅ 5. Create dossier history (audit trail)
    await createDossierHistoryInternal({ ... }, this.queryRepo)
    
    // ✅ 6. Convert applicant & beneficiary
    const applicant = convertApplicant({ type: request.type, applicant: request.applicant })
    const beneficiary = convertBeneficiary({ type: request.type, beneficiary: request.beneficiary })
    
    // ✅ 7. Call internal service via NATS
    const { ok, response } = await CreateDossierService.request(
        this.communicatorService,
        {
            dossierId,
            state: request.isDraft ? DRAFT : PENDING_SUBMISSION,
            code: generatedCode,
            applicantIdentity: applicant.id,
            applicantName: applicant.name,
            // ... many other fields
        },
        { timeout: 5000 }
    )
    
    // ✅ 8. Handle response
    if (!ok || !response) return throwServerError()
    
    return { dossierId }
}
```

#### **Step 4: PrepareData - Parallel Validation**

```typescript
async handle(request, citizen) {
    // ✅ Parallel calls to other services
    const [departmentResponse, formalityResponse, categoryResponse] = 
        await Promise.all([
            GetDepartmentByIdsService.request(this.communicatorService, 
                { departmentIds: [request.departmentId] },
                { timeout: 3000 }
            ),
            GetFormalityService.request(this.communicatorService,
                { formalityId: request.formalityId, caseId: request.formalityCaseId },
                { timeout: 3000 }
            ),
            GetCategoryByIdsService.request(this.communicatorService,
                { categoryIds: [request.categoryId] },
                { timeout: 3000 }
            )
        ])
    
    // ✅ Check all responses
    if (!departmentResponse.ok) return throwObjectNotFound('Department not found')
    if (!formalityResponse.ok) return throwObjectNotFound('Formality not found')
    if (!categoryResponse.ok) return throwObjectNotFound('Category not found')
    
    return {
        department: departmentResponse.response.departments[0],
        formality: formalityResponse.response.formality,
        category: categoryResponse.response.categories[0],
        // ... other validated data
    }
}
```

#### **Step 5: Internal Service - Event Sourcing**

```typescript
@Injectable()
export class CreateDossierService implements OnModuleInit {
    static SERVICE_NAME = 'submitting.create-dossier'
    
    async onModuleInit() {
        await this.communicatorService.reply(
            CreateDossierService.SERVICE_NAME,
            async (request) => await this.handle(request)
        )
    }
    
    private async handle(request: CreateDossierRequest) {
        // ✅ 1. Create aggregate
        const aggregate = this.commandRepo.dossierEventRepo.create(
            request.dossierId,
            {
                id: request.dossierId,
                code: request.code,
                state: request.state,
                applicantInfo: request.applicant,
                formality: { ... },
                timeline: { createdAt: request.createdAt, ... },
                // ... full state
            }
        )
        
        // ✅ 2. Create event
        const event = new DossierCreated({ ...request })
        
        // ✅ 3. Commit (Save + Cache + Emit)
        await this.commandRepo.dossierEventRepo.commit(
            aggregate,
            event,
            { createdAt: request.createdAt }
        )
        
        return { dossierId: request.dossierId }
    }
    
    // ✅ 4. Projection handler
    @OnEvent(DossierCreated.name)
    async projectDossierCreated({ event, id, data, createdAt }) {
        await this.alertService.projectionWrapper(
            'submitting',
            DossierCreated.name,
            { event, id, data, createdAt },
            async (eventData) => {
                // Transform to query model (denormalized)
                const queryModel = this.queryRepo.submittingDossierRepo.create({
                    id: eventData.id,
                    code: eventData.data.code,
                    departmentId: eventData.data.organization.departmentId,
                    departmentName: eventData.data.department.name,
                    applicantName: eventData.data.applicantInfo.citizen?.name,
                    formalityId: eventData.data.formality.id,
                    formalityName: eventData.data.formality.name,
                    state: eventData.data.state,
                    createdAt: eventData.data.timeline.createdAt,
                    cache: { /* complex nested data */ }
                })
                
                await this.queryRepo.submittingDossierRepo.insert(queryModel)
            }
        )
    }
}
```

### 6.3. Database State After Create

**Event Store (Command Side):**

```sql
mysql> SELECT * FROM submitting_dossier_events 
       WHERE id = '01927f1c-3e8d-7890-abcd-0242ac120002';

+----------+---------+---------------+-----------------+-------------------------+
| id       | version | created_at    | event_name      | data (snapshot)         |
+----------+---------+---------------+-----------------+-------------------------+
| 01927f1c | 1       | 1730000000000 | DossierCreated  | {"id":"...","code":"..."|
+----------+---------+---------------+-----------------+-------------------------+
```

**Query Model (Query Side):**

```sql
mysql> SELECT id, code, department_name, applicant_name, state, created_at 
       FROM submitting_dossier 
       WHERE id = '01927f1c-3e8d-7890-abcd-0242ac120002';

+----------+--------------------+-----------------------+----------------+--------------------+---------------+
| id       | code               | department_name       | applicant_name | state              | created_at    |
+----------+--------------------+-----------------------+----------------+--------------------+---------------+
| 01927f1c | EVO-001-2024-00001 | Planning & Investment | John Doe       | PENDING_SUBMISSION | 1730000000000 |
+----------+--------------------+-----------------------+----------------+--------------------+---------------+
```

---

## 7. LIST RETRIEVAL FLOW (READ FLOW)

### 7.1. Sequence Diagram - Query Flow

```mermaid
sequenceDiagram
    actor Admin
    participant Controller
    participant Service
    participant QueryRepo
    participant MySQL
    
    Admin->>Controller: POST /submitting/list-dossier-by-admin
    Note over Controller: @GuardAdmin()<br/>Check permission
    
    Controller->>Service: handle(request)
    
    Service->>Service: Build WHERE conditions
    Service->>Service: Build ORDER BY
    Service->>Service: Build LIMIT/OFFSET
    
    Service->>QueryRepo: findAndCount(query)
    QueryRepo->>MySQL: SELECT with indexes
    MySQL-->>QueryRepo: [rows, total]
    QueryRepo-->>Service: Return results
    
    Service->>Service: Filter cache JSON fields
    Service->>Service: Transform to DTOs
    
    Service-->>Controller: {total, rows, page}
    Controller-->>Admin: 200 OK + pagination data
```

### 7.2. Implementation

#### **Step 1: HTTP Request**

```http
POST /api/v1/submitting/list-dossier-by-admin HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "page": 1,
  "limit": 20,
  "state": "PENDING_SUBMISSION",
  "code": "EVO-001",
  "formalityId": "formality-uuid-001",
  "departmentId": "dept-uuid-001",
  "applicantName": "John",
  "createdDateFrom": 1729900000000,
  "createdDateTo": 1730000000000,
  "sortBy": "createdAt",
  "sortOrder": "DESC"
}
```

#### **Step 2: Service - Build Query**

```typescript
async handle(request: ListDossierByAdminRequest) {
    // ✅ Build WHERE clause
    const where: FindOptionsWhere<SubmittingDossier> = {}
    
    if (request.state) where.state = Equal(request.state)
    if (request.code) where.code = Like(`%${request.code}%`)
    if (request.formalityId) where.formalityId = Equal(request.formalityId)
    if (request.departmentId) where.departmentId = Equal(request.departmentId)
    
    // Date range
    if (request.createdDateFrom || request.createdDateTo) {
        where.createdAt = Between(
            request.createdDateFrom || 0,
            request.createdDateTo || Date.now()
        )
    }
    
    // Array filter
    if (request.categoryIds?.length) {
        where.categoryId = In(request.categoryIds)
    }
    
    // ✅ Build ORDER BY
    const order: any = {}
    order[request.sortBy || 'createdAt'] = request.sortOrder || 'DESC'
    order.id = 'DESC'  // Secondary sort
    
    // ✅ Pagination
    const page = request.page || 1
    const take = request.limit || 20
    const skip = (page - 1) * take
    
    // ✅ Execute query
    const [rows, total] = await this.queryRepo.submittingDossierRepo.findAndCount({
        where,
        order,
        skip,
        take,
    })
    
    // ✅ Filter cache JSON fields
    let filteredRows = rows
    
    if (request.applicantName) {
        filteredRows = filteredRows.filter(row =>
            row.applicantName?.toLowerCase()
                .includes(request.applicantName.toLowerCase())
        )
    }
    
    if (request.formalityName) {
        filteredRows = filteredRows.filter(row =>
            row.cache?.formality?.name?.toLowerCase()
                .includes(request.formalityName.toLowerCase())
        )
    }
    
    // ✅ Transform to DTO
    return {
        total,
        totalPage: Math.ceil(total / take),
        page,
        rows: filteredRows.map(row => ListDossierByAdminItem.fromEntity(row))
    }
}
```

#### **Step 3: Generated SQL**

```sql
-- Main query
SELECT 
    d.id, d.code, d.department_id, d.department_name,
    d.applicant_name, d.formality_id, d.formality_name,
    d.state, d.created_at, d.submitted_at, d.cache
FROM submitting_dossier d
WHERE 
    d.state = 'PENDING_SUBMISSION'
    AND d.code LIKE '%EVO-001%'
    AND d.formality_id = 'formality-uuid-001'
    AND d.department_id = 'dept-uuid-001'
    AND d.created_at BETWEEN 1729900000000 AND 1730000000000
ORDER BY d.created_at DESC, d.id DESC
LIMIT 20 OFFSET 0;

-- Count query
SELECT COUNT(*) as total
FROM submitting_dossier d
WHERE 
    d.state = 'PENDING_SUBMISSION'
    AND d.code LIKE '%EVO-001%'
    AND d.formality_id = 'formality-uuid-001'
    AND d.department_id = 'dept-uuid-001'
    AND d.created_at BETWEEN 1729900000000 AND 1730000000000;
```

**Performance:**
- ✅ Uses indexes on: `state`, `code`, `formality_id`, `department_id`, `created_at`
- ✅ No JOINs needed (denormalized)
- ✅ Fast response: ~50-200ms

#### **Step 4: Response**

```json
{
  "total": 150,
  "totalPage": 8,
  "page": 1,
  "rows": [
    {
      "id": "01927f1c-3e8d-7890-abcd-0242ac120002",
      "code": "EVO-001-2024-00001",
      "name": "Business License Application - John Doe",
      "state": "PENDING_SUBMISSION",
      "createdAt": 1730000000000,
      "applicantName": "John Doe",
      "formalityName": "Business License Application",
      "departmentName": "Planning & Investment Department",
      "totalAmount": 100000
    }
    // ... 19 more items
  ]
}
```

---

## 8. DATABASE DESIGN

### 8.1. Naming Conventions

| Level | Convention | Example |
|-------|------------|---------|
| **Database** | snake_case | `evo_command`, `evo_query` |
| **Table** | **plural** snake_case + **service prefix** | `submitting_dossier`, `organizing_employees` |
| **Column** | snake_case | `created_at`, `department_id` |
| **TypeORM Entity** | camelCase | `createdAt`, `departmentId` |

### 8.2. Command vs Query Schema

**Command Side (Event Store):**
```sql
CREATE TABLE {entity}_events (
    id VARCHAR(36) PRIMARY KEY,
    version INT NOT NULL,
    created_at BIGINT NOT NULL,
    event_name VARCHAR(255),
    event_payload JSON,        -- Event data
    data JSON,                 -- Full state snapshot
    INDEX idx_created_at (created_at)
);
```

**Query Side (Denormalized):**
```sql
CREATE TABLE {service}_{entity} (
    id VARCHAR(36) PRIMARY KEY,
    
    -- Denormalized fields for queries
    code VARCHAR(128) UNIQUE,
    department_id VARCHAR(36),
    department_name VARCHAR(256),
    applicant_name VARCHAR(256),
    state VARCHAR(64),
    
    -- Timestamps
    created_at BIGINT,
    updated_at BIGINT,
    
    -- Cache for complex data
    cache JSON,
    
    -- Indexes for fast queries
    INDEX idx_code (code),
    INDEX idx_department_id (department_id),
    INDEX idx_state (state),
    INDEX idx_created_at (created_at)
);
```

### 8.3. Migration Strategy

```bash
# Generate migration
pnpm migration:generate organizing AddEmployeeFields

# Run migration
pnpm migration:run organizing

# Rollback
pnpm typeorm migration:revert
```

---

## 9. API DESIGN PATTERNS

### 9.1. Endpoint Convention

**❗ IMPORTANT: ALL APIS USE POST METHOD**

```
Format: POST /{service}/{resource}/{action}

✅ Correct:
POST /auth/admin/sign-in
POST /configuring/formality/create
POST /organizing/department/list-by-admin
POST /submitting/dossier/update-by-citizen

❌ Wrong (not used):
GET /configuring/formality/list
PUT /organizing/department/123
DELETE /submitting/dossier/456
```

### 9.2. DTO Pattern

```typescript
// Request DTO with validation
export class CreateDossierRequest {
    @IsRequiredString(1, 256, { trim: true })
    name: string
    
    @IsUuid(true)
    formalityId: string
    
    @ValidateNested()
    @Type(() => ApplicantInfoDto)
    applicant: ApplicantInfoDto
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProfileComponentDto)
    profileComponents: ProfileComponentDto[]
}

// Response DTO
export class CreateDossierResponse {
    dossierId: string
}
```

### 9.3. Controller Pattern

```typescript
@Controller()
@GuardCitizen()  // or @GuardAdmin(PERMISSION_NAME)
export class CitizenCreatingController {
    @ApiOperation({ summary: 'API for creating dossier by citizen' })
    @ApiOkResponse({ type: CreateDossierResponse })
    @Post('/submitting/create-dossier-by-citizen')
    async createDossier(
        @Body() request: CreateDossierRequest,
        @Citizen() citizen: CitizenInfoDto
    ): Promise<CreateDossierResponse> {
        return await this.service.handle(request, citizen)
    }
}
```

---

## 10. BEST PRACTICES

### 10.1. Service Communication

**✅ DO:**
```typescript
// Always set timeout
const { ok, response } = await Service.request(
    communicatorService,
    request,
    { timeout: 3000, traceId: ctx.traceId }
)

// Always check ok and response
if (!ok || !response) return throwServerError()

// Use parallel requests
const [user, dept] = await Promise.all([
    GetUserService.request(...),
    GetDepartmentService.request(...)
])
```

**❌ DON'T:**
```typescript
// No timeout
await Service.request(communicatorService, request)

// Not checking response
const { response } = await Service.request(...)
return response.data  // ❌ might be null

// Sequential when can be parallel
const user = await GetUserService.request(...)
const dept = await GetDepartmentService.request(...)
```

### 10.2. Event Sourcing

**✅ DO:**
```typescript
// Wrap projection with alertService
@OnEvent(DossierCreated.name)
async handleDossierCreated(event) {
    await this.alertService.projectionWrapper(
        'submitting',
        DossierCreated.name,
        event,
        async (e) => {
            await this.updateQueryModel(e)
        }
    )
}

// Idempotent projections
await this.queryRepo.dossier.upsert({ id, ... }, ['id'])
```

**❌ DON'T:**
```typescript
// No error handling - crashes app
@OnEvent(DossierCreated.name)
async handleDossierCreated(event) {
    await this.queryRepo.dossier.insert({ ... })  // ❌
}

// Not idempotent
await this.queryRepo.dossier.insert({ ... })  // ❌ duplicate key error
```

### 10.3. Error Handling

```typescript
// Use typed errors
throwObjectNotFound('Formality not found')
throwBadRequest('Formality code already exists')
throwServerError()
throwException({ code: 'CUSTOM_ERROR', message: 'Custom message' })

// Handle service errors
if (!ok) {
    if (code === Service.NOT_FOUND_CODE) {
        return throwObjectNotFound()
    }
    if (code === Service.UNAUTHORIZED_CODE) {
        return throwUnauthorized()
    }
    return throwServerError()
}
```

### 10.4. Performance Optimization

```typescript
// ✅ Use Redis cache
const cached = await this.cacheRepo.get(key)
if (cached) return cached

const data = await this.queryRepo.find(...)
await this.cacheRepo.set(key, data, 600)  // 10min TTL

// ✅ Select only needed fields
await repo.find({
    select: ['id', 'name', 'code'],
    where: { state: STATE.ACTIVE }
})

// ✅ Use pagination
await repo.find({
    skip: (page - 1) * pageSize,
    take: pageSize
})

// ✅ Use transactions for multiple writes
await this.dataSource.transaction(async manager => {
    await this.commandRepo.entity1.commit(agg1, event1, { manager })
    await this.commandRepo.entity2.commit(agg2, event2, { manager })
})
```

### 10.5. Code Organization

```
features/{domain}/{action}/{use-case}/
├── {use-case}.service.ts     # Main logic
├── {use-case}.dto.ts          # Request/Response DTOs
├── {use-case}.module.ts       # NestJS module
├── prepare-data.ts            # Validation (optional)
└── {use-case}.service.spec.ts # Unit tests
```

---

## 📚 REFERENCES

### Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [NATS Documentation](https://docs.nats.io/)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

### Internal Docs
- `API_DEVELOPMENT_GUIDE.md` - Hướng dẫn phát triển API
- `CLAUDE.md` - Hướng dẫn cho AI assistant
- `migration.md` - Database migration guide
- `queue.md` - Queue & message handling

### Project Scripts
```bash
# Development
pnpm dev {service}           # Start single service
pnpm dev:all                 # Start all services

# Code generation
pnpm gen:feature {path} {FeatureName}  # Generate feature scaffold
pnpm gen:fm {service}                   # Export features

# Database
pnpm migration:generate {service} {MigrationName}
pnpm migration:run {service}

# Testing
pnpm test                    # Run all tests
pnpm test:cov                # Coverage report

# Build
pnpm build {service}         # Build specific service
```

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Maintainer**: EVO Development Team

---

© 2024 Mobifone - EVO Microservice API

