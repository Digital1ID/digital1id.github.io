import axios from 'axios';

export default async function handler(request, response) {
  const config = {
    tnn16: 'https://www.tnnthailand.com/content-public-api/signer-url?prefix=/live/',
    true4u: 'https://www.true4u.com/live-api/signer-url?prefix=/live/',
  };

  const channel = request.query.channel;

  if (!channel || !config[channel]) {
    return response.status(404).send('Parameter "channel" is required and must be valid.');
  }

  try {
    const { data } = await axios.get(config[channel], {
      headers: { 'User-Agent': 'PostmanRuntime/7.41.0' },
    });

    const transformers = {
      tnn16: (d) => d,
      true4u: (d) => d.replace('playlist.m3u8', 'pl_720p/index.m3u8'),
    };

    const streamingUrl = transformers[channel](data);

    if (!streamingUrl) {
      return response.status(500).send('Failed to resolve streaming URL.');
    }

    console.log(`Channel: ${channel}, URL: ${streamingUrl}`);
    response.redirect(302, streamingUrl);
  } catch (error) {
    console.error(`Error fetching stream for ${channel}:`, error.message);
    return response.status(500).send('Internal server error.');
  }
}