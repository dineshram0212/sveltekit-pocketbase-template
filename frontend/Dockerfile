FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code (this is mostly for the initial build, 
# for dev we will use volume mounts)
COPY . .

# Expose the dev port
EXPOSE 5173

# Run dev server with host binding
CMD ["pnpm", "dev", "--host"]
