# Deployment Guide

## Vercel Deployment

### Required Environment Variables

Add these environment variables in your Vercel project settings:

```bash
# MongoDB Database (Required for full functionality)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/perthglorynews

# Authentication Secret (Required for security)
AUTH_SECRET=your-random-secret-here-change-this

# Redis Cache (Optional - improves performance)
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token-here
```

### MongoDB Setup (Free)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Create a new cluster (M0 Free tier)

2. **Configure Database Access**
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password
   - Set role to "Read and write to any database"

3. **Configure Network Access**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Vercel)
   - Click "Confirm"

4. **Get Connection String**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `perthglorynews`

5. **Add to Vercel**
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add `MONGODB_URI` with your connection string

### Initialize Database

After deployment, initialize the database indexes by calling:

```bash
curl -X POST https://your-app.vercel.app/api/setup-db \
  -H "Authorization: Bearer your-auth-secret"
```

Replace:
- `your-app.vercel.app` with your Vercel domain
- `your-auth-secret` with your `AUTH_SECRET` value

### Features Status

| Feature | Without MongoDB | With MongoDB |
|---------|----------------|--------------|
| News Display | ✅ Works | ✅ Works |
| Ladder | ✅ Works | ✅ Works |
| User Registration | ❌ Disabled | ✅ Works |
| User Login | ❌ Disabled | ✅ Works |
| Comments | ❌ Disabled | ✅ Works |
| Forum | ❌ Disabled | ✅ Works |

### Generate AUTH_SECRET

Generate a secure random secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Upstash Redis Setup (Optional)

1. Go to https://upstash.com/
2. Create free account
3. Create new Redis database
4. Copy REST URL and Token
5. Add to Vercel environment variables

### Troubleshooting

**500 Error on deployment:**
- Check Vercel logs for specific error
- Verify MONGODB_URI is correctly formatted
- Ensure database allows connections from anywhere

**Features not working:**
- Verify MONGODB_URI is set in Vercel
- Run the setup-db endpoint to create indexes
- Check Vercel function logs for errors

**Build failures:**
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies are installed
