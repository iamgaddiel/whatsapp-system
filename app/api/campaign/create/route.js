import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/serverStuff';
import { update_user } from '@/lib/utils';
import { uploadFile } from '@/lib/google_storage/google_storage';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Parse the incoming form data
  const formData = await req.formData();

  const campaignName = formData.get('campaignName');
  const fromNumber = formData.get('fromNumber');
  const message = formData.get('message');
  const leads = JSON.parse(formData.get('leads') || '[]');
  const media = formData.get('media') || null;
  let campaignId = formData.get('campaignId');

  if (!campaignId) {
    campaignId = campaignName.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(-4);
  }
  
  if (!campaignName || !fromNumber || !message || !leads) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  let fileUrl = null;
  if (media !== null) {
    const buffer = Buffer.from(await media.arrayBuffer()); // Get the binary buffer
    const base64Content = buffer.toString('base64'); // Convert the buffer to Base64
    const fileName = `${Date.now()}-${media.originalFilename}`;
    fileUrl = await uploadFile(base64Content, fileName, media.type);
  }

  const currentDateTimeUTC = new Date().toISOString();
  const timeZone = "GMT+00:00";

  const campaignData = {
    campaignName,
    fromNumber,
    message,
    leads,
    mediaURL: fileUrl,
    timeZone,
    scheduleTime: currentDateTimeUTC,
    campaignId,
    completed: false
  }
  
  const apiKey = req.headers.get('x-api-key');

  const userEmail = session?.user?.email;  

  const success = session ? await update_user({email: userEmail}, {campaigns: campaignData}, "$push") : await update_user({apiKey: apiKey}, {campaigns: campaignData}, "$push");

  
  if (session) {
  if (success) {
    return NextResponse.json({ message: 'Campaign created successfully' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
  } else {
    if (success) {
      return NextResponse.json({ message: 'Campaign created successfully', campaignId: campaignId }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }
}
