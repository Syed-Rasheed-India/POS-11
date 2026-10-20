"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, KeyValue, SectionTitle, StatCard, Tabs } from "@/components/ui";
import { Field, SelectInput, TextInput, Textarea, btnPrimary, btnSoft } from "@/components/ui";
import { PermissionMatrix, type PermissionGroup } from "@/components/permissions";
import { HorizontalBars } from "@/components/charts";
import { FormPanel, Grid, StatusBadge, TableCard, ViewHeader } from "../parts";
import {
  adminSessions,
  companies as saCompanies,
  auditLogs,
  accessTokens,
  companyById,
  companyNotifications,
  loginLogs,
  notificationRules,
  notificationTemplates,
  passwordResets,
  platformAdmins,
  platformNotifications,
  platformPermissions,
  platformRoles,
  saMetrics,
  securityEvents,
  ticketAttachments,
  tickets,
  twoFactor,
} from "@/lib/sa-data";
import { dateShort, dateTime, num, timeAgo } from "@/lib/format";
import {
  createPlatformAdmin,
  getPlatformAdminRoles,
  getPlatformAdmins,
  getPlatformAdminSessions,
  getPlatformPermissions,
  getPlatformRolePermissions,
  getPlatformAdminUserRoles,
  getPlatformAdminLoginLogs,
  updatePlatformAdmin,
  type PlatformAdmin,
  type PlatformAdminRole,
  type PlatformPermission,
  type PlatformRolePermission,
  type PlatformAdminUserRole,
  type PlatformAdminSession,
  type PlatformAdminLoginLog,
} from "@/lib/api/platform";

const adminName = (id: number) => platformAdmins.find((a) => a.id === id)?.username ?? "System";

/* --------------------------- security & audit --------------------------- */

export function SecurityView({ tab }: { tab: string }) {
  const m = saMetrics();
  const [sessions,setSessions]=useState<PlatformAdminSession[]>([]);
  const [logins,setLogins]=useState<PlatformAdminLoginLog[]>([]);
  useEffect(()=>{Promise.all([getPlatformAdminSessions(),getPlatformAdminLoginLogs()]).then(([s,l])=>{setSessions(s);setLogins(l);}).catch(console.error);},[]);
  return (
    <div>
      <ViewHeader
        title="Security & audit"
        subtitle="Who did what, from where, and when"
        crumbs={[{ label: "Super Admin" }, { label: "Security" }]}
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Platform admins" value={num(platformAdmins.length)} icon="users" tone="blue" />
        <StatCard label="MFA enabled" value={`${platformAdmins.filter((a) => a.mfa).length}/${platformAdmins.length}`} icon="shield" tone="green" />
        <StatCard label="Security events" value={num(securityEvents.length)} icon="alert" tone="orange" />
        <StatCard label="Audit entries" value={num(auditLogs.length)} icon="activity" tone="purple" />
      </div>
      <Tabs
        baseHref="/super-admin/audit"
        active={tab}
        tabs={[
          { key: "events", label: "Security events" },
          { key: "audit", label: "Audit log" },
          { key: "sessions", label: "Sessions" },
          { key: "logins", label: "Login history" },
          { key: "tokens", label: "Access tokens" },
          { key: "mfa", label: "Two factor & resets" },
        ]}
      />

      {tab === "audit" ? (
        <Card title="platform_audit_logs" subtitle="Every privileged change with before and after values">
          <TableCard
            title=""
            columns={[
              { key: "admin", label: "Admin" },
              {
                key: "action",
                label: "Action",
                render: (row: any) => <Badge tone="blue">{row.action}</Badge>,
              },
              { key: "company", label: "Vendor", render: (row: any) => (row.companyId ? companyById(row.companyId)?.name ?? "—" : "Platform") },
              { key: "entity", label: "Table", render: (row: any) => <span className="font-mono text-[11px]">{row.entity}</span> },
              {
                key: "change",
                label: "Change",
                render: (row: any) => (
                  <span className="font-mono text-[10px] text-[#646B72]">
                    {row.old ? `${JSON.stringify(row.old)} → ` : ""}
                    {row.next ? JSON.stringify(row.next) : "created"}
                  </span>
                ),
              },
              { key: "ip", label: "IP", render: (row: any) => <span className="font-mono text-[11px]">{row.ip}</span> },
              { key: "at", label: "When", render: (row: any) => dateTime(row.at) },
            ]}
            rows={auditLogs}
          />
        </Card>
      ) : tab === "sessions" ? (
        <TableCard
          title="platform_admin_sessions"
          columns={[
            { key: "admin", label: "Admin", render: (row: any) => adminName(row.adminId) },
            { key: "device", label: "Device" },
            { key: "location", label: "Location" },
            { key: "ip", label: "IP", render: (row: any) => <span className="font-mono text-[11px]">{row.ip}</span> },
            { key: "last", label: "Last activity", render: (row: any) => timeAgo(row.last) },
            { key: "expires", label: "Expires", render: (row: any) => dateShort(row.expires) },
            {
              key: "status",
              label: "State",
              render: (row: any) => <StatusBadge value={row.active ? "ACTIVE" : "REVOKED"} />,
            },
            {
              key: "actions",
              label: "",
              align: "right",
              render: (row: any) =>
                row.active ? (
                  <button type="button" className="text-xs font-bold text-[#D63031]">
                    Revoke
                  </button>
                ) : null,
            },
          ]}
          rows={(sessions.length ? sessions.map((x) => ({ id:x.id, adminId:x.admin_id, device:x.device_info ? JSON.stringify(x.device_info) : (x.user_agent ?? "—"), location:"—", ip:x.ip_address ?? "—", last:new Date(x.last_activity_at ?? x.created_at), expires:new Date(x.expires_at ?? x.created_at), active:!x.revoked_at && (!x.expires_at || new Date(x.expires_at)>new Date()) })) : adminSessions) as any}
        />
      ) : tab === "logins" ? (
        <TableCard
          title="platform_admin_login_logs"
          columns={[
            { key: "username", label: "Username", render: (row: any) => <span className="font-mono text-xs">{row.username}</span> },
            {
              key: "status",
              label: "Result",
              render: (row: any) => <StatusBadge value={row.status} />,
            },
            { key: "ip", label: "IP", render: (row: any) => <span className="font-mono text-[11px]">{row.ip}</span> },
            { key: "agent", label: "Browser" },
            { key: "reason", label: "Detail", render: (row: any) => row.reason ?? "—" },
            { key: "at", label: "When", render: (row: any) => dateTime(row.at) },
          ]}
          rows={(logins.length ? logins.map((x) => ({ id:x.id, username:x.username ?? "—", status:x.login_status, ip:x.ip_address ?? "—", agent:x.user_agent ?? "—", at:new Date(x.logged_at), reason:x.failure_reason ?? null })) : loginLogs) as any}
        />
      ) : tab === "tokens" ? (
        <TableCard
          title="access_tokens"
          subtitle="Only the token fingerprint is ever stored"
          columns={[
            { key: "hash", label: "Token", render: (row: any) => <span className="font-mono text-xs">{row.hash}</span> },
            { key: "type", label: "Type", render: (row: any) => <Badge tone="blue">{row.type}</Badge> },
            { key: "ownerName", label: "Owner" },
            {
              key: "scopes",
              label: "Scopes",
              render: (row: any) => (
                <div className="flex flex-wrap gap-1">
                  {row.scopes.map((scope: string) => (
                    <span key={scope} className="rounded-full bg-[#F1F3F5] px-2 py-0.5 font-mono text-[10px] text-[#646B72]">
                      {scope}
                    </span>
                  ))}
                </div>
              ),
            },
            { key: "lastUsed", label: "Last used", render: (row: any) => timeAgo(row.lastUsed) },
            { key: "expires", label: "Expires", render: (row: any) => dateShort(row.expires) },
            { key: "revoked", label: "State", render: (row: any) => <StatusBadge value={row.revoked ? "REVOKED" : "ACTIVE"} /> },
          ]}
          rows={accessTokens}
        />
      ) : tab === "mfa" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="two_factor_auth">
            <TableCard
              title=""
              columns={[
                { key: "user", label: "Account", render: (row: any) => <span className="font-mono text-xs">{row.user}</span> },
                { key: "userType", label: "Type", render: (row: any) => <Badge tone="blue">{row.userType}</Badge> },
                { key: "method", label: "Method" },
                { key: "recovery", label: "Recovery codes", align: "right" },
                { key: "verified", label: "Verified", render: (row: any) => (row.verified ? dateShort(row.verified) : "—") },
                { key: "enabled", label: "State", render: (row: any) => <StatusBadge value={row.enabled ? "ACTIVE" : "INACTIVE"} /> },
              ]}
              rows={twoFactor}
            />
          </Card>
          <Card title="password_reset_tokens">
            <TableCard
              title=""
              columns={[
                { key: "user", label: "Account", render: (row: any) => <span className="font-mono text-[11px]">{row.user}</span> },
                { key: "userType", label: "Type", render: (row: any) => <Badge tone="blue">{row.userType}</Badge> },
                { key: "ip", label: "IP", render: (row: any) => <span className="font-mono text-[11px]">{row.ip}</span> },
                { key: "expires", label: "Expires", render: (row: any) => dateShort(row.expires) },
                {
                  key: "used",
                  label: "Used",
                  render: (row: any) => (row.used ? dateShort(row.used) : <StatusBadge value="PENDING" />),
                },
              ]}
              rows={passwordResets}
            />
          </Card>
        </div>
      ) : (
        <Grid>
          <Card title="Security events" icon="alert">
            <TableCard
              title=""
              columns={[
                { key: "type", label: "Event", render: (row: any) => <Badge tone="purple">{row.type.replace(/_/g, " ")}</Badge> },
                {
                  key: "severity",
                  label: "Severity",
                  render: (row: any) => <StatusBadge value={row.severity} />,
                },
                { key: "admin", label: "Admin" },
                { key: "company", label: "Vendor" },
                { key: "description", label: "What happened" },
                { key: "ip", label: "IP", render: (row: any) => <span className="font-mono text-[11px]">{row.ip}</span> },
                { key: "at", label: "When", render: (row: any) => timeAgo(row.at) },
              ]}
              rows={securityEvents}
            />
          </Card>
          <Card title="Events by severity" icon="chart">
            <HorizontalBars
              data={["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((severity) => ({
                label: severity,
                value: securityEvents.filter((e) => e.severity === severity).length,
              }))}
              color="#092C4C"
            />
          </Card>
        </Grid>
      )}
    </div>
  );
}

/* ------------------------- admins and roles ----------------------------- */

export function AdminsView() {
  const [admins,setAdmins]=useState<PlatformAdmin[]>([]);
  const [roles,setRoles]=useState<PlatformAdminRole[]>([]);
  const [sessions,setSessions]=useState<PlatformAdminSession[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([getPlatformAdmins(),getPlatformAdminRoles(),getPlatformAdminSessions()]).then(([a,r,ss])=>{setAdmins(a);setRoles(r);setSessions(ss);}).catch(console.error).finally(()=>setLoading(false));},[]);
  const adminRows=admins.length?admins:platformAdmins.map(a=>({id:a.id,uuid:"",username:a.username,email:a.email,first_name:a.firstName,last_name:a.lastName,phone:a.phone,status:a.status,last_login_at:a.lastLogin?.toISOString?.()??null,password_changed_at:null,failed_login_attempts:a.failed,locked_until:null,created_at:"",updated_at:""} as PlatformAdmin));
  const roleRows=roles.length?roles:platformRoles.map(r=>({id:r.id,uuid:"",role_code:r.code,role_name:r.name,description:r.description,is_system_role:r.system,is_active:r.active,created_at:"",updated_at:""} as PlatformAdminRole));
  const activeSessions=sessions.length?sessions.filter(s=>!s.revoked_at && (!s.expires_at || new Date(s.expires_at)>new Date())).length:adminSessions.filter(s=>s.active).length;
  return <div><ViewHeader title="Platform admins" subtitle="Your own team — separate from vendor users" crumbs={[{label:"Super Admin"},{label:"Platform"},{label:"Admins"}]} actions={<Link href="/super-admin/roles" className={btnSoft}>Roles & permissions</Link>} /><div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Admins" value={num(adminRows.length)} icon="users" tone="blue" /><StatCard label="MFA enabled" value="—" icon="shield" tone="green" /><StatCard label="Locked" value={num(adminRows.filter(a=>a.status.toUpperCase()==="LOCKED").length)} icon="lock" tone="red" /><StatCard label="Active sessions" value={num(activeSessions)} icon="server" tone="purple" /></div><Grid><Card title="Admin accounts">{loading?<p className="p-4 text-sm text-[#646B72]">Loading admins...</p>:<TableCard title="" columns={[{key:"name",label:"Admin",render:r=><div><p className="font-semibold">{r.first_name} {r.last_name}</p><p className="text-[11px] text-[#7A8086]">{r.email}</p></div>},{key:"username",label:"Username",render:r=><span className="font-mono text-xs">{r.username}</span>},{key:"role",label:"Role",render:r=><Badge tone="purple">{roleRows[0]?.role_name ?? "—"}</Badge>},{key:"lastLogin",label:"Last login",render:r=>r.last_login_at?timeAgo(r.last_login_at):"Never"},{key:"status",label:"Status",render:r=><StatusBadge value={r.status} />},{key:"actions",label:"",align:"right",render:r=><button type="button" onClick={async()=>{const next=r.status.toUpperCase()==="ACTIVE"?"INACTIVE":"ACTIVE"; const updated=await updatePlatformAdmin(r.id,{status:next}); setAdmins(prev=>prev.map(x=>x.id===r.id?updated:x));}} className="text-xs font-bold text-[#0984E3]">{r.status.toUpperCase()==="LOCKED"?"Unlock":r.status.toUpperCase()==="ACTIVE"?"Disable":"Enable"}</button>}]} rows={adminRows} />}</Card><FormPanel title="Add platform admin" submitLabel="Create admin" onSubmit={async(values)=>{const firstName=String(values.firstName??"").trim();const lastName=String(values.lastName??"").trim();const email=String(values.email??"").trim();if(!firstName||!email)return;const created=await createPlatformAdmin({username:email.split("@")[0],email,first_name:firstName,last_name:lastName||null,phone:String(values.phone??"")||null,password_hash:"change-me",status:"ACTIVE"});setAdmins(prev=>[created,...prev]);}}><Field label="First name"><TextInput name="firstName" /></Field><Field label="Last name"><TextInput name="lastName" /></Field><Field label="Email"><TextInput name="email" type="email" /></Field><Field label="Phone"><TextInput name="phone" /></Field><Field label="Role"><SelectInput name="roleId" options={roleRows.map(r=>({value:r.id,label:r.role_name}))} placeholder="Select role" /></Field><p className="text-[11px] text-[#7A8086]">Platform admin accounts are stored in <span className="font-mono">platform_admins</span>.</p></FormPanel></Grid></div>;
}

export function RolesView() {
  const [roles,setRoles]=useState<PlatformAdminRole[]>([]);
  const [permissions,setPermissions]=useState<PlatformPermission[]>([]);
  const [links,setLinks]=useState<PlatformRolePermission[]>([]);
  const [assignments,setAssignments]=useState<PlatformAdminUserRole[]>([]);
  useEffect(()=>{Promise.all([getPlatformAdminRoles(),getPlatformPermissions(),getPlatformRolePermissions(),getPlatformAdminUserRoles()]).then(([r,p,l,a])=>{setRoles(r);setPermissions(p);setLinks(l);setAssignments(a);}).catch(console.error);},[]);
  const roleRows=roles.length?roles:platformRoles.map(r=>({id:r.id,uuid:"",role_code:r.code,role_name:r.name,description:r.description,is_system_role:r.system,is_active:r.active,created_at:"",updated_at:""} as PlatformAdminRole));
  const permissionRows=permissions.length?permissions:platformPermissions.map(p=>({id:p.id,permission_code:p.code,permission_name:p.name,module:p.module,action:p.action,description:null,created_at:"",updated_at:""} as PlatformPermission));
  const groups=useMemo<PermissionGroup[]>(()=>Object.values(permissionRows.reduce<Record<string,PermissionGroup>>((acc,p)=>{const module=p.module??"General";acc[module]??={module,permissions:[]};acc[module].permissions.push({key:p.permission_code,name:p.permission_name});return acc;},{})),[permissionRows]);
  const [selected,setSelected]=useState<Record<number,string[]>>({});
  useEffect(()=>{const next:Record<number,string[]>={};roleRows.forEach(r=>{next[r.id]=links.filter(x=>x.role_id===r.id).map(x=>permissionRows.find(p=>p.id===x.permission_id)?.permission_code).filter(Boolean) as string[];if(!next[r.id]?.length){const fallback=platformRoles.find(x=>x.id===r.id);next[r.id]=fallback?.permissions??[];}});setSelected(next);},[roles,links,permissions]);
  return <div><ViewHeader title="Roles & permissions" subtitle="What each platform admin role is allowed to do" crumbs={[{label:"Super Admin"},{label:"Platform"},{label:"Roles"}]} /><div className="grid gap-4 xl:grid-cols-2">{roleRows.map(role=><Card key={role.id} title={role.role_name} subtitle={`${role.description??""} · ${assignments.filter(a=>a.role_id===role.id).length} admin${assignments.filter(a=>a.role_id===role.id).length===1?"":"s"}`} actions={role.is_system_role?<Badge tone="orange">System role</Badge>:<Badge tone="blue">Custom</Badge>}><PermissionMatrix groups={groups} selected={selected[role.id]??[]} onChange={keys=>setSelected(prev=>({...prev,[role.id]:keys}))}/><div className="mt-4 flex items-center gap-3"><button type="button" className={btnPrimary} onClick={async()=>{const wanted=new Set(selected[role.id]??[]);const current=links.filter(x=>x.role_id===role.id);const toDelete=current.filter(x=>{const code=permissionRows.find(p=>p.id===x.permission_id)?.permission_code;return code&&!wanted.has(code);});for(const x of toDelete){await import("@/lib/api/platform").then(m=>m.deletePlatformRolePermission(x.id));}for(const code of wanted){const permission=permissionRows.find(p=>p.permission_code===code);if(permission&&!current.some(x=>x.permission_id===permission.id)) await import("@/lib/api/platform").then(m=>m.createPlatformRolePermission({role_id:role.id,permission_id:permission.id}));}setLinks(await getPlatformRolePermissions());}}>Save permissions</button><span className="text-[11px] text-[#7A8086]">{(selected[role.id]??[]).length} of {permissionRows.length} permissions</span></div></Card>)}</div></div>;
}

/* ------------------------------ support --------------------------------- */

export function TicketsView({ status }: { status: string }) {
  const [filter, setFilter] = useState(status);
  const [rows, setRows] = useState(tickets);
  const filtered = filter === "ALL" ? rows : rows.filter((ticket) => ticket.status === filter);
  const open = rows.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  return (
    <div>
      <ViewHeader
        title="Support tickets"
        subtitle={`${open} open · ${rows.length} total`}
        crumbs={[{ label: "Super Admin" }, { label: "Support" }]}
      />
      <Card title="Queue" actions={
        <div className="w-48">
          <SelectInput
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            options={[
              { value: "ALL", label: "All tickets" },
              { value: "OPEN", label: "Open" },
              { value: "IN_PROGRESS", label: "In progress" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "CLOSED", label: "Closed" },
            ]}
          />
        </div>
      }>
        <TableCard
          title=""
          rowHref={(row) => `/super-admin/tickets/${row.id}`}
          columns={[
            { key: "number", label: "Ticket", render: (row: any) => <span className="font-semibold">{row.number}</span> },
            { key: "subject", label: "Subject" },
            {
              key: "company",
              label: "Vendor",
              render: (row: any) => (row.companyId ? companyById(row.companyId)?.name ?? "—" : "Prospect"),
            },
            { key: "category", label: "Category", render: (row: any) => <Badge tone="blue">{row.category}</Badge> },
            { key: "priority", label: "Priority", render: (row: any) => <StatusBadge value={row.priority} /> },
            { key: "assignedTo", label: "Assignee", render: (row: any) => row.assignedTo ?? "Unassigned" },
            { key: "created", label: "Opened", render: (row: any) => timeAgo(row.created) },
            { key: "status", label: "Status", render: (row: any) => <StatusBadge value={row.status} /> },
          ]}
          rows={filtered}
        />
      </Card>
      <div className="mt-4">
        <button type="button" onClick={() => setRows(tickets)} className="text-xs font-bold text-[#0984E3]">
          Reset demo queue
        </button>
      </div>
    </div>
  );
}

export function TicketDetailView({ id }: { id: number }) {
  const ticket = tickets.find((t) => t.id === id);
  const [rows, setRows] = useState(ticket ? [ticket] : []);
  const current = rows[0];
  const [reply, setReply] = useState("");
  if (!current) return <Card title="Ticket not found">This ticket does not exist.</Card>;
  const company = current.companyId ? companyById(current.companyId) : null;
  const attachments = ticketAttachments.filter((a) => a.ticketId === current.id);

  return (
    <div>
      <ViewHeader
        title={current.subject}
        subtitle={`${current.number} · ${company?.name ?? "Prospect"} · opened by ${current.createdBy}`}
        crumbs={[
          { label: "Super Admin", href: "/super-admin" },
          { label: "Support", href: "/super-admin/tickets" },
          { label: current.number },
        ]}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => setRows([{ ...current, status: "RESOLVED" }])}
            >
              Mark resolved
            </button>
            <button
              type="button"
              className={btnSoft}
              onClick={() => setRows([{ ...current, status: "CLOSED" }])}
            >
              Close ticket
            </button>
          </div>
        }
      />
      <Grid>
        <Card title="Conversation">
          <ul className="space-y-4">
            {current.messages.map((message, index) => (
              <li
                key={index}
                className={`rounded-xl p-4 ${message.from === "PLATFORM" ? "bg-[#FFF6EE]" : "bg-[#F9FAFB]"}`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#212B36]">{message.author}</p>
                  <span className="text-[11px] text-[#7A8086]">{dateTime(message.at)}</span>
                </div>
                <p className="whitespace-pre-line text-sm text-[#646B72]">{message.body}</p>
                {"attachment" in message && message.attachment ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#0984E3]">
                    📎 {message.attachment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-[#E6EAED] pt-4">
            <Field label="Reply">
              <Textarea
                name="body"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Write your reply to the vendor…"
              />
            </Field>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                className={btnPrimary}
                onClick={() => {
                  if (!reply.trim()) return;
                  setRows([
                    {
                      ...current,
                      status: "IN_PROGRESS",
                      messages: [
                        ...current.messages,
                        { from: "PLATFORM", author: "Adrian Herman", body: reply, at: new Date() },
                      ],
                    },
                  ]);
                  setReply("");
                }}
              >
                Send reply
              </button>
              <span className="text-[11px] text-[#7A8086]">Replies are emailed and shown in the vendor inbox</span>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Ticket details">
            <KeyValue
              items={[
                { label: "Ticket number", value: current.number },
                { label: "Category", value: current.category },
                { label: "Priority", value: <StatusBadge value={current.priority} /> },
                { label: "Status", value: <StatusBadge value={current.status} /> },
                { label: "Requester", value: current.createdBy },
                { label: "Assignee", value: current.assignedTo ?? "Unassigned" },
                { label: "Opened", value: dateTime(current.created) },
                { label: "Closed", value: current.closed ? dateTime(current.closed) : "—" },
              ]}
            />
            {company ? (
              <Link href={`/super-admin/vendors/${company.id}`} className="mt-3 inline-block text-xs font-bold text-[#FE9F43]">
                Open vendor →
              </Link>
            ) : null}
          </Card>
          <Card title="Attachments">
            {attachments.length === 0 ? (
              <p className="text-sm text-[#7A8086]">No files attached to this ticket.</p>
            ) : (
              <ul className="space-y-2">
                {attachments.map((file) => (
                  <li key={file.id} className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-[11px] text-[#7A8086]">{file.type}</p>
                    </div>
                    <span className="text-xs font-bold text-[#646B72]">{file.size}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </Grid>
    </div>
  );
}

/* ---------------------------- notifications ----------------------------- */

export function NotificationsView({ tab }: { tab: string }) {
  return (
    <div>
      <ViewHeader
        title="Notifications"
        subtitle="Announcements to vendors, inbox messages, templates and rules"
        crumbs={[{ label: "Super Admin" }, { label: "Notifications" }]}
      />
      <Tabs
        baseHref="/super-admin/notifications"
        active={tab}
        tabs={[
          { key: "platform", label: "Announcements" },
          { key: "inbox", label: "Vendor inbox" },
          { key: "templates", label: "Templates" },
          { key: "rules", label: "Rules" },
        ]}
      />
      {tab === "inbox" ? (
        <TableCard
          title="company_notifications"
          columns={[
            { key: "company", label: "Vendor", render: (row: any) => companyById(row.companyId)?.name ?? "—" },
            { key: "title", label: "Title", render: (row: any) => <span className="font-semibold">{row.title}</span> },
            { key: "message", label: "Message" },
            { key: "type", label: "Type", render: (row: any) => <Badge tone="blue">{row.type}</Badge> },
            {
              key: "read",
              label: "Read",
              render: (row: any) => <StatusBadge value={row.read ? "CLOSED" : "OPEN"} />,
            },
            { key: "at", label: "Sent", render: (row: any) => timeAgo(row.at) },
          ]}
          rows={companyNotifications}
        />
      ) : tab === "templates" ? (
        <Grid>
          <Card title="notification_templates">
            <TableCard
              title=""
              columns={[
                { key: "code", label: "Template", render: (row: any) => <span className="font-mono text-xs">{row.code}</span> },
                { key: "channel", label: "Channel", render: (row: any) => <Badge tone="purple">{row.channel}</Badge> },
                { key: "subject", label: "Subject", render: (row: any) => row.subject || "—" },
                {
                  key: "body",
                  label: "Body",
                  render: (row: any) => <span className="text-xs text-[#646B72]">{row.body}</span>,
                },
                {
                  key: "variables",
                  label: "Variables",
                  render: (row: any) => (
                    <div className="flex flex-wrap gap-1">
                      {row.variables.map((variable: string) => (
                        <span key={variable} className="rounded-full bg-[#F1F3F5] px-2 py-0.5 font-mono text-[10px] text-[#646B72]">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  ),
                },
                { key: "active", label: "State", render: (row: any) => <StatusBadge value={row.active ? "ACTIVE" : "INACTIVE"} /> },
              ]}
              rows={notificationTemplates}
            />
          </Card>
          <FormPanel title="Create template" submitLabel="Save template">
            <Field label="Template code">
              <TextInput name="code" placeholder="PLAN_UPGRADED" />
            </Field>
            <Field label="Channel">
              <SelectInput
                name="channel"
                defaultValue="EMAIL"
                options={[
                  { value: "EMAIL", label: "Email" },
                  { value: "SMS", label: "SMS" },
                  { value: "WHATSAPP", label: "WhatsApp" },
                  { value: "IN_APP", label: "In app" },
                  { value: "PUSH", label: "Push" },
                ]}
              />
            </Field>
            <Field label="Subject">
              <TextInput name="subject" placeholder="Your plan has been upgraded" />
            </Field>
            <Field label="Body">
              <Textarea name="body" placeholder="Hi {{owner}}, {{company}} is now on {{plan}}…" />
            </Field>
          </FormPanel>
        </Grid>
      ) : tab === "rules" ? (
        <Grid>
          <Card title="subscription_notification_rules">
            <TableCard
              title=""
              columns={[
                { key: "event", label: "Event", render: (row: any) => <Badge tone="blue">{row.event}</Badge> },
                {
                  key: "template",
                  label: "Template",
                  render: (row: any) => notificationTemplates.find((t) => t.id === row.templateId)?.code ?? "—",
                },
                { key: "daysBefore", label: "Days before", align: "right" },
                { key: "channel", label: "Channel" },
                { key: "active", label: "State", render: (row: any) => <StatusBadge value={row.active ? "ACTIVE" : "INACTIVE"} /> },
              ]}
              rows={notificationRules}
            />
          </Card>
          <Card title="How rules fire" icon="clock">
            <SectionTitle hint="Example">Trial ending</SectionTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              {["7 days left → email", "2 days left → SMS", "0 days → in app"].map((step, index, all) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#092C4C] px-2.5 py-1.5 text-white">{step}</span>
                  {index < all.length - 1 ? <span className="text-[#FE9F43]">→</span> : null}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-[#646B72]">
              Rules are evaluated hourly. A notification is skipped if the vendor already acted on the
              event, and every send is logged against the vendor inbox.
            </p>
          </Card>
        </Grid>
      ) : (
        <Grid>
          <Card title="platform_notifications">
            <TableCard
              title=""
              columns={[
                { key: "title", label: "Title", render: (row: any) => <span className="font-semibold">{row.title}</span> },
                { key: "message", label: "Message" },
                { key: "type", label: "Type", render: (row: any) => <Badge tone="purple">{row.type}</Badge> },
                { key: "priority", label: "Priority", render: (row: any) => <StatusBadge value={row.priority} /> },
                {
                  key: "target",
                  label: "Audience",
                  render: (row: any) =>
                    row.target === "ALL" ? (
                      <Badge tone="green">All vendors</Badge>
                    ) : (
                      companyById(row.targetId ?? 0)?.name ?? "—"
                    ),
                },
                { key: "scheduled", label: "Scheduled", render: (row: any) => dateTime(row.scheduled) },
                { key: "by", label: "Created by" },
              ]}
              rows={platformNotifications}
            />
          </Card>
          <FormPanel title="Broadcast" submitLabel="Schedule notification">
            <Field label="Title">
              <TextInput name="title" placeholder="Scheduled maintenance on Sunday" />
            </Field>
            <Field label="Audience">
              <SelectInput
                name="target"
                defaultValue="ALL"
                options={[
                  { value: "ALL", label: "All vendors" },
                  ...companyList(),
                ]}
              />
            </Field>
            <Field label="Priority">
              <SelectInput
                name="priority"
                defaultValue="MEDIUM"
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "URGENT", label: "Urgent" },
                ]}
              />
            </Field>
            <Field label="Message">
              <Textarea name="message" />
            </Field>
          </FormPanel>
        </Grid>
      )}
    </div>
  );
}

function companyList() {
  return saCompanies.map((c) => ({ value: c.id, label: c.name }));
}
