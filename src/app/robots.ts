import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: '/',
                disallow: '/user'
            }
        ],
        sitemap: `${process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL}/sitemap.xml`
    }
}