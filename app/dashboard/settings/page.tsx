import { RepositorySettings } from "@/module/settings/components/repository-settings";
import { getConnectedRepositories } from "@/module/settings/actions";

export default async function SettingsPage() {
  const repositories = await getConnectedRepositories();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage connected repositories</p>
      </div>

      <RepositorySettings repositories={repositories} />
    </div>
  );
}
