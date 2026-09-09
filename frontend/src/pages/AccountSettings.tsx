import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  addTeamMember,
  cancelSubscription,
  createTeam,
  downloadSavedSearchCsv,
  downgradeSubscription,
  fetchBilling,
  fetchCurrentAccount,
  fetchSearchHistory,
  fetchTeam,
  requestEmailVerification,
  requestPasswordReset,
  updateProfile,
  verifyEmail,
} from "../lib/api";
import { useAuth } from "../lib/auth";

export default function AccountSettings() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [billing, setBilling] = useState<any>(null);
  const [searches, setSearches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [teamName, setTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  async function refreshAccount() {
    if (!token) return;
    const account = await fetchCurrentAccount(token);
    login(token, account.user);
    setBilling(await fetchBilling(token));
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
      setNotice(downgrade ? "Plan changed to Free." : "Subscription cancelled.");
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

  async function createTeamSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !teamName.trim()) return;
    await createTeam(token, teamName.trim());
    const data = await fetchTeam(token);
    setTeams(data.teams ?? []);
    setTeamName("");
  }

  async function addMember(teamId: string) {
    if (!token || !memberEmail.trim()) return;
    await addTeamMember(token, teamId, memberEmail.trim());
    const data = await fetchTeam(token);
    setTeams(data.teams ?? []);
    setMemberEmail("");
  }

  async function createVerificationToken() {
    if (!token) return;
    const result = await requestEmailVerification(token);
    setNotice(result.verificationToken ? `Dev verification token: ${result.verificationToken}` : "Verification email queued.");
  }

  async function verifyToken() {
    const tokenValue = window.prompt("Paste verification token");
    if (!tokenValue) return;
    await verifyEmail(tokenValue);
    await refreshAccount();
    setNotice("Email verified.");
  }

  async function sendResetToken() {
    if (!user?.email) return;
    const result = await requestPasswordReset(user.email);
    setNotice(result.resetToken ? `Dev reset token: ${result.resetToken}` : "Password reset email queued.");
  }

  return (
    <main className="settings-page">
      <header className="settings-header">
        <Link className="wordmark" to="/">
          Ask<span>Loom</span>
        </Link>
        <Link className="secondary-action" to="/">
          Back
        </Link>
      </header>

      <section className="settings-grid">
        <div className="settings-panel">
          <h1>Account</h1>
          <p>{user?.email}</p>
          <p>Plan: {billing?.currentPlan?.name ?? "Free"}</p>
          <p>Email: {user?.emailVerified ? "Verified" : "Not verified"}</p>
          {notice && <p className="notice">{notice}</p>}
          <form className="settings-form" onSubmit={saveProfile}>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
            <button disabled={busy}>Save profile</button>
          </form>
          <div className="button-row">
            <button className="secondary-action" onClick={createVerificationToken}>Verify email</button>
            <button className="secondary-action" onClick={verifyToken}>Submit token</button>
            <button className="secondary-action" onClick={sendResetToken}>Password reset</button>
          </div>
        </div>

        <div className="settings-panel">
          <h2>Billing</h2>
          <div className="button-row">
            <button className="secondary-action" disabled={busy} onClick={() => handleCancel(false)}>Cancel</button>
            <button className="secondary-action" disabled={busy} onClick={() => handleCancel(true)}>Downgrade</button>
          </div>
          {(billing?.transactions ?? []).map((transaction: any) => (
            <div className="table-row" key={transaction.id}>
              <span>{transaction.plan?.name ?? "Plan"}</span>
              <span>{transaction.currency} {transaction.amount}</span>
              <span>{transaction.status}</span>
            </div>
          ))}
        </div>

        <div className="settings-panel">
          <h2>Saved Searches</h2>
          {searches.map((search) => (
            <div className="table-row" key={search.id}>
              <span>{search.seed}</span>
              <span>{search.total} ideas</span>
              <button className="secondary-action" onClick={() => exportSearch(search.id)}>CSV</button>
            </div>
          ))}
        </div>

        <div className="settings-panel">
          <h2>Team</h2>
          <form className="settings-form" onSubmit={createTeamSubmit}>
            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name" />
            <button>Create team</button>
          </form>
          {teams.map((team) => (
            <div key={team.id} className="team-block">
              <strong>{team.name}</strong>
              <div className="settings-form inline">
                <input value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="member@example.com" />
                <button onClick={() => addMember(team.id)}>Add</button>
              </div>
              {(team.memberships ?? []).map((member: any) => (
                <div className="table-row" key={member.id}>
                  <span>{member.user?.email}</span>
                  <span>{member.role}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
