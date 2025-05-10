import { setResponseStatus } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  console.log("🎯 VAST Route ID:", id)

  if (!id) {
    setResponseStatus(event, 400)
    return 'Missing ad ID'
  }

  const ad = await prisma.ad.findUnique({
    where: { id: Number(id) }
  })

  if (!ad || !ad.media_url) {
    setResponseStatus(event, 404)
    return 'Ad not found'
  }

  const vastXml = `<?xml version="1.0" encoding="UTF-8"?>
  <VAST version="3.0">
    <Ad id="${ad.id}">
      <InLine>
        <AdSystem>MyBibleAppAds</AdSystem>
        <AdTitle>${ad.title}</AdTitle>
        <Creatives>
          <Creative>
            <Linear>
              <Duration>00:00:${String(ad.duration || 15).padStart(2, '0')}</Duration>
              <MediaFiles>
                <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                  <![CDATA[${ad.media_url.trim()}]]>
                </MediaFile>
              </MediaFiles>
            </Linear>
          </Creative>
        </Creatives>
      </InLine>
    </Ad>
  </VAST>`
  

  event.node.res.setHeader('Content-Type', 'application/xml')
  return vastXml
})
