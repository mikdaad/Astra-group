import AdminRewardsClient from './reward-client'

export default async function Page(
  props: { params: Promise<{ schemeid: string }> }
) {
  const { schemeid } = await props.params;
  return <AdminRewardsClient schemeId={schemeid} />
}
