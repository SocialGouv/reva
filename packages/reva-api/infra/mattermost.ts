import https from 'https';

export const notifyNewCandidacy = async (candidacyId: string) => new Promise<any>((resolve, reject) => {
    if (!process.env.MATTERMOST_HOSTNAME) {
      return 
    }

    const data = JSON.stringify({
      text: `Environnement: ${process.env.APP_ENV || 'dev'} | :tada: Nouvelle candidature ${process.env.BASE_URL}/admin/candidacies/${candidacyId} :tada:`
    })
           
    const options = {
      hostname: process.env.MATTERMOST_HOSTNAME,
      port: 443,
      path: `/hooks/${process.env.MATTERMOST_WEBHOOK_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }
    const req = https.request(options, res => {
        if (res.statusCode !== 200) {
            reject(`Error while notifying the team for the new candidacy ${candidacyId}`)
        }

      res.on('data', d => {
        resolve(d)
      })
    })
    req.write(data)
    req.end()
})
