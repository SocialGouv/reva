export const getAccessToken = async () => {
  const response = await fetch(process.env.DIAGO_AUTH_URL as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${process.env.DIAGO_CLIENT_ID}&client_secret=${process.env.DIAGO_CLIENT_SECRET}`
  })
  const tokenData = await response.json()
  return tokenData.access_token
}