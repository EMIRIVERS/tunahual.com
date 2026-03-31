import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_PREFIX = "nahual_image_";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  imageUrl: string;
  timestamp: number;
}

export function useNahualImage(
  animalGuia: string,
  nahualName: string,
  type: "animal" | "place" = "animal",
  skip: boolean = false
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `${CACHE_PREFIX}${type}_${nahualName}`;
    
    const loadImage = async () => {
      setIsLoading(true);
      setError(null);

      // Check cache first
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (Date.now() - entry.timestamp < CACHE_EXPIRY) {
            setImageUrl(entry.imageUrl);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log("Cache read error:", e);
      }

      // Generate new image
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "generate-nahual-image",
          {
            body: { animalGuia, nahualName, type },
          }
        );

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (data?.imageUrl) {
          setImageUrl(data.imageUrl);
          
          // Save to cache
          try {
            const entry: CacheEntry = {
              imageUrl: data.imageUrl,
              timestamp: Date.now(),
            };
            localStorage.setItem(cacheKey, JSON.stringify(entry));
          } catch (e) {
            console.log("Cache write error:", e);
          }
        } else if (data?.error) {
          throw new Error(data.error);
        }
      } catch (e) {
        console.error("Error generating image:", e);
        setError(e instanceof Error ? e.message : "Error generating image");
      } finally {
        setIsLoading(false);
      }
    };

    if (animalGuia && nahualName && !skip) {
      loadImage();
    } else if (skip) {
      setIsLoading(false);
    }
  }, [animalGuia, nahualName, type, skip]);

  return { imageUrl, isLoading, error };
}
