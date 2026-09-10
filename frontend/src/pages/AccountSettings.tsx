import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  addTeamMember,
  cancelSubscription,
  createTeam,
  deleteSavedSearch,
  downloadSavedSearchCsv,
  downgradeSubscription,
  fetchBilling,
  fetchCurrentAccount,
  fetchSearchHistory,
  fetchTeam,
  removeTeamMember,
  requestEmailVerification,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  verifyEmail,
} from "../lib/api";
import { useAuth } from "../lib/auth";

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default function AccountSettings() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [billing, setBilling] = useState<any>(null);
  const [searches, setSearches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [teamName, setTeamName] = useState("");
  const [memberEmailByTeam, setMemberEmailByTeam] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currentPlan = billing?.currentPlan;
  const latestSubscription = billing?.subscriptions?.[0];
  const totalTeamSeats = currentPlan?.teamSeatLimit ?? 0;
  const usedTeamSeats = useMemo(
    () => teams.reduce((sum, team) => sum + (team.memberships?.length ?? 0), 0),
    [teams]
  );

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
      return;
    }

    Promise.all([fetchBilling(token), fetchSearchHistory(token), fetchTeam(token)])
      .then(([billingData, searchData, teamData]) => {
        setBilling(billingData);
        setSearches(searchData.searches ?? []);
        setTeams(teamData.teams ?? []);
      })
      .catch((error: Error) => setNotice(error.message));
  }, [navigate, token, user]);

  useEffect(() => {
    const verificationToken = searchParams.get("verificationToken");
    if (verificationToken) {
      verifyEmail(verificationToken)
        .then(async () => {
          await refreshAccount();
          setNotice("Email verified.");
          setSearchParams({});
        })
        .catch((error: Error) => setNotice(error.message));
      return;
    }

    const resetToken = searchParams.get("resetToken");
    if (resetToken) {
      const nextPassword = window.prompt("Enter a new password for AskLoom");
      if (!nextPassword) return;
      resetPassword(resetToken, nextPassword)
        .then(() => {
          setNotice("Password updated. Please log in again.");
          setSearchParams({});
        })
        .catch((error: Error) => setNotice(error.message));
    }
  }, [searchParams, setSearchParams]);

  async function refreshAccount() {
    if (!token) return;
    const account = await fetchCurrentAccount(token);
    login(token, account.user);
    setBilling(await fetchBilling(token));
  }

  async function reloadTeam() {
    if (!token) return;
    const data = await fetchTeam(token);
    setTeams(data.teams ?? []);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await updateProfile(token, { firstName, lastName });
      login(token, { ...user!, ...result.user });
      setNotice("Profile updated.");
    } catch (error: any) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel(downgrade = false) {
    if (!token) return;
    setBusy(true);
    setNotice(null);
    try {
      await (downgrade ? downgradeSubscription(token) : cancelSubscription(token));
      await refreshAccount();
      setNotice(downgrade ? "Plan changed to Free." : "Subscription updated.");
    } catch (error: any) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function exportSearch(searchId: string) {
    if (!token) return;
    const blob = await downloadSavedSearchCsv(token, searchId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "askloom-saved-search.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function removeSearch(searchId: string) {
    if (!token) return;
    await deleteSavedSearch(token, searchId);
    setSearches((prev) => prev.filter((search) => search.id !== searchId));
  }

  async function createTeamSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !teamName.trim()) return;
    try {
      await createTeam(token, teamName.trim());
      await reloadTeam();
      setTeamName("");
      setNotice("Team created.");
    } catch (error: any) {
      setNotice(error.message);
    }
  }

  async function addMember(teamId: string) {
    if (!token) return;
    const email = memberEmailByTeam[teamId]?.trim();
    if (!email) return;
    try {
      await addTeamMember(token, teamId, email);
      await reloadTeam();
      setMemberEmailByTeam((prev) => ({ ...prev, [teamId]: "" }));
      setNotice("Team member added.");
    } catch (error: any) {
      setNotice(error.message);
    }
  }

  async function handleRemoveMember(teamId: string, memberId: string) {
    if (!token) return;
    try {
      await removeTeamMember(token, teamId, memberId);
      await reloadTeam();
      setNotice("Team member removed.");
    } catch (error: any) {
      setNotice(error.message);
    }
  }

  async function createVerificationToken() {
    if (!token) return;
    const result = await requestEmailVerification(token);
    setNotice(
      result.verificationToken
        ? `Dev verification token: ${result.verificationToken}`
        : "Verification email queued."
    );
  }

  async function sendResetToken() {
    if (!user?.email) return;
    const result = await requestPasswordReset(user.email);
    setNotice(
      result.resetToken ? `Dev reset token: ${result.resetToken}` : "Password reset email queued."
    );
  }

  return (
    <main className="settings-page account-page">
      <header className="settings-header">
        <Link className="wordmark" to="/">
          Ask<span>Loom</span>
        </Link>
        <Link className="secondary-action" to="/">
          Back
        </Link>
      </header>

      <section className="account-hero-panel">
        <div>
          <div className="eyebrow">Workspace</div>
          <h1>{currentPlan?.name ?? "Free"} account</h1>
          <p>{user?.email}</p>
        </div>
        <div className="account-plan-summary">
          <span>{user?.emailVerified ? "Verified email" : "Email not verified"}</span>
          <strong>{currentPlan?.name ?? "Free"}</strong>
          <small>
            {latestSubscription?.currentPeriodEnd
              ? `Renews/ends ${formatDate(latestSubscription.currentPeriodEnd)}`
              : "No active billing period"}
          </small>
        </div>
      </section>

      {notice && <p className="admin-notice">{notice}</p>}

      <section className="account-grid">
        <div className="settings-panel account-panel">
          <h2>Profile</h2>
          <form className="settings-form" onSubmit={saveProfile}>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
            <button disabled={busy}>Save profile</button>
          </form>
          <div className="button-row">
            {!user?.emailVerified && (
              <button className="secondary-action" type="button" onClick={createVerificationToken}>
                Send verification
              </button>
            )}
            <button className="secondary-action" type="button" onClick={sendResetToken}>
              Password reset
            </button>
          </div>
        </div>

        <div className="settings-panel account-panel">
          <h2>Billing</h2>
          <div className="billing-actions">
            <button className="secondary-action" disabled={busy || !currentPlan} onClick={() => handleCancel(false)}>
              Cancel renewal
            </button>
            <button className="secondary-action" disabled={busy || !currentPlan} onClick={() => handleCancel(true)}>
              Downgrade now
            </button>
          </div>
          <div className="account-list">
            {(billing?.transactions ?? []).slice(0, 6).map((transaction: any) => (
              <div className="account-list-row" key={transaction.id}>
                <div>
                  <strong>{transaction.plan?.name ?? "Plan"}</strong>
                  <span>{formatDate(transaction.createdAt)}</span>
                </div>
                <span>{transaction.currency} {transaction.amount}</span>
                <span className={`status-badge ${transaction.status === "SUCCESSFUL" ? "success" : "pending"}`}>
                  {transaction.status}
                </span>
              </div>
            ))}
            {(billing?.transactions ?? []).length === 0 && <p className="empty-state">No payments yet.</p>}
          </div>
        </div>

        <div className="settings-panel account-panel">
          <h2>Saved searches</h2>
          <div className="account-list">
            {searches.map((search) => (
              <div className="account-list-row" key={search.id}>
                <div>
                  <strong>{search.seed}</strong>
                  <span>{search.total} ideas · {formatDate(search.createdAt)}</span>
                </div>
                <button className="secondary-action" onClick={() => exportSearch(search.id)}>CSV</button>
                <button className="secondary-action" onClick={() => removeSearch(search.id)}>Delete</button>
              </div>
            ))}
            {searches.length === 0 && <p className="empty-state">Search while logged in to build your topic library.</p>}
          </div>
        </div>

        <div className="settings-panel account-panel">
          <div className="account-panel-heading">
            <h2>Team</h2>
            {totalTeamSeats > 0 && <span>{usedTeamSeats}/{totalTeamSeats} seats used</span>}
          </div>
          <form className="settings-form inline" onSubmit={createTeamSubmit}>
            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name" />
            <button>Create</button>
          </form>
          {teams.map((team) => (
            <div key={team.id} className="team-block polished-team">
              <strong>{team.name}</strong>
              <div className="settings-form inline">
                <input
                  value={memberEmailByTeam[team.id] ?? ""}
                  onChange={(e) =>
                    setMemberEmailByTeam((prev) => ({ ...prev, [team.id]: e.target.value }))
                  }
                  placeholder="member@example.com"
                />
                <button type="button" onClick={() => addMember(team.id)}>Add</button>
              </div>
              {(team.memberships ?? []).map((member: any) => (
                <div className="account-list-row" key={member.id}>
                  <div>
                    <strong>{member.user?.email}</strong>
                    <span>{member.role}</span>
                  </div>
                  {member.role !== "OWNER" && (
                    <button
                      className="secondary-action"
                      type="button"
                      onClick={() => handleRemoveMember(team.id, member.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
          {teams.length === 0 && <p className="empty-state">Agency users can create a team workspace here.</p>}
        </div>
      </section>
    </main>
  );
}
