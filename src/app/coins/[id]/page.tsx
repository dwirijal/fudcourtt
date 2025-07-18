
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDetailedCoinData } from "@/lib/coingecko";
import { getDefiLlamaCoinData } from "@/lib/defillama";
import { getPosts } from "@/lib/ghost";
import { calculateSupportResistanceLevels } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Scale, Zap, Link as LinkIcon, Newspaper, Flame, TrendingUp, TrendingDown } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import TradingViewWidget from "@/components/molecules/trading-view-chart";
import { SanitizedHtml } from "@/components/atoms/sanitized-html";

interface CoinPageProps {
  params: {
    id: string;
  };
}

export default async function CoinPage({ params }: CoinPageProps) {
  const coinData = await getDetailedCoinData(params.id);
  if (!coinData) {
    notFound();
  }

  const defiLlamaData = await getDefiLlamaCoinData(coinData.symbol);
  const { supportLevel, resistanceLevel } = calculateSupportResistanceLevels(coinData.current_price, coinData.ath, coinData.atl);
  const relatedArticles = await getPosts({ tag: coinData.symbol?.toLowerCase(), limit: 3 });

  const { name, symbol, image, current_price, market_cap, total_volume, description, links, price_change_percentage_24h } = coinData;

  return (
    <div className="container-full section-spacing">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Beranda</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/markets">Pasar</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name ?? 'N/A'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8 flex flex-col md:flex-row items-start gap-6">
        {image?.large && (
          <Image
            src={image.large}
            alt={name ?? ''}
            width={80}
            height={80}
            className="rounded-full shadow-lg h-20 w-20 flex-shrink-0"
          />
        )}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tighter text-text-primary">
              {name ?? 'N/A'}
            </h1>
            <span className="text-3xl font-medium text-text-secondary">({symbol?.toUpperCase() ?? 'N/A'})</span>
          </div>
          <p className="text-lg text-text-secondary max-w-3xl">
            Data harga, kapitalisasi pasar, dan informasi detail untuk {name ?? 'koin ini'}.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="card-primary p-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Harga Saat Ini</CardTitle>
                <DollarSign className="h-5 w-5 text-text-tertiary" />
            </CardHeader>
            <CardContent className="p-0">
                <div className="text-3xl font-bold font-mono text-text-primary">{formatCurrency(current_price)}</div>
                <div className={`text-sm font-medium flex items-center gap-1 ${price_change_percentage_24h >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                    {price_change_percentage_24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {price_change_percentage_24h?.toFixed(2) ?? 'N/A'}% (24j)
                </div>
            </CardContent>
        </Card>
        <Card className="card-primary p-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Kapitalisasi Pasar</CardTitle>
                <Scale className="h-5 w-5 text-text-tertiary" />
            </CardHeader>
            <CardContent className="p-0">
                <div className="text-3xl font-bold font-mono text-text-primary">{formatCurrency(market_cap, 'usd', true)}</div>
                <p className="text-xs font-medium text-text-secondary">Volume 24j: {formatCurrency(total_volume, 'usd', true)}</p>
            </CardContent>
        </Card>
         <Suspense fallback={<Skeleton className="h-[124px]" />}>
            <Card className="card-primary p-5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-secondary">Total Value Locked (TVL)</CardTitle>
                    <Zap className="h-5 w-5 text-text-tertiary" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-3xl font-bold font-mono text-text-primary">{defiLlamaData?.tvl ? formatCurrency(defiLlamaData.tvl, 'usd', true) : 'N/A'}</div>
                     <p className="text-xs font-medium text-text-secondary truncate">
                        {defiLlamaData?.chains && defiLlamaData.chains.length > 0 ? `Jaringan: ${defiLlamaData.chains.join(', ')}` : 'Tidak ada data jaringan'}
                     </p>
                </CardContent>
            </Card>
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <TradingViewWidget symbol={symbol || ''} />
        </div>
        <div className="md:col-span-2 space-y-6">
            <Card className="card-primary">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold font-mono">Statistik Harga</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium text-text-secondary">Harga Tertinggi 24j</TableCell>
                                <TableCell className="text-right font-mono text-text-primary">{formatCurrency(coinData.high_24h)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-text-secondary">Harga Terendah 24j</TableCell>
                                <TableCell className="text-right font-mono text-text-primary">{formatCurrency(coinData.low_24h)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-text-secondary">All-Time High (ATH)</TableCell>
                                <TableCell className="text-right font-mono text-text-primary">
                                    {formatCurrency(coinData.ath)} ({coinData.ath_date ? format(new Date(coinData.ath_date), 'dd MMM yyyy') : 'N/A'})
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-text-secondary">All-Time Low (ATL)</TableCell>
                                <TableCell className="text-right font-mono text-text-primary">
                                    {formatCurrency(coinData.atl)} ({coinData.atl_date ? format(new Date(coinData.atl_date), 'dd MMM yyyy') : 'N/A'})
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-text-secondary">Level Support</TableCell>
                                <TableCell className="text-right font-mono font-semibold text-market-up">{formatCurrency(supportLevel)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-text-secondary">Level Resistance</TableCell>
                                <TableCell className="text-right font-mono font-semibold text-market-down">{formatCurrency(resistanceLevel)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            {links && (
            <Card className="card-primary p-5">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg font-semibold font-mono">Tautan Resmi</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 gap-4">
                        {links.homepage?.[0] && (
                            <a href={links.homepage[0]} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-start gap-2">
                              <LinkIcon className="h-4 w-4" /> Situs Web
                            </a>
                        )}
                        {links.blockchain_site?.[0] && (
                             <a href={links.blockchain_site[0]} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-start gap-2">
                              <Flame className="h-4 w-4" /> Explorer
                            </a>
                        )}
                        {links.subreddit_url && (
                            <a href={links.subreddit_url} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-start gap-2">
                              <svg className="h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Reddit</title><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.342.342 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.248 0-.688-.561-1.25-1.248-1.25zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.248 1.248.688 0 1.25-.561 1.25-1.248 0-.688-.562-1.25-1.25-1.25zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                               Subreddit
                            </a>
                        )}
                        {links.repos_url?.github?.[0] && (
                            <a href={links.repos_url.github[0]} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-start gap-2">
                              <svg className="h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                               GitHub
                            </a>
                        )}
                    </div>
                </CardContent>
            </Card>
            )}
        </div>
      </div>
      
      {description?.en && (
        <Card className="card-primary my-6 p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-semibold font-mono">Tentang {name ?? 'koin ini'}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <SanitizedHtml
                className="prose max-w-none"
                html={description.en}
             />
          </CardContent>
        </Card>
      )}

      {relatedArticles.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 font-mono">
            <Newspaper className="h-6 w-6 text-text-secondary" /> Artikel Terkait
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((article) => (
              <Card key={article.id} className="card-news flex flex-col overflow-hidden">
                <Link href={`/news/${article.slug}`} className="block h-full flex flex-col group">
                    {article.feature_image && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={article.feature_image}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-slow group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <CardHeader className="flex-grow p-4">
                      {article.primary_tag && (
                        <Badge variant="secondary" className="w-fit">
                          {article.primary_tag.name}
                        </Badge>
                      )}
                      <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors mt-2">
                          {article.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-text-secondary line-clamp-3 mt-1">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 mt-auto text-xs font-medium text-text-tertiary">
                      Diterbitkan pada {format(new Date(article.published_at), "d MMMM yyyy")}
                    </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
