import { Property } from '../types';
import { supabase } from './supabaseClient';

export const propertyService = {
  async getAllProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPropertyById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getPropertyAIOverview(id: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('ai_overview')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data?.ai_overview || null;
  },

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    // First, verify the property exists
    const existingProperty = await this.getPropertyById(id);
    if (!existingProperty) {
      throw new Error(`Property with id ${id} not found`);
    }

    // If exists, proceed with update
    const { error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    // Fetch the updated property to confirm
    return this.getPropertyById(id);
  },

  // async searchProperties(query: string): Promise<Property[]> {
  //   try {
  //     // Extract property details from the query if it's a contextualized query
  //     const propertyMatch = query.match(/property "([^"]+)" located at ([^"]+) priced at \$(\d+)/i);
      
  //     if (propertyMatch) {
  //       const [, title, location] = propertyMatch;
  //       // Search by title
  //       const titleQuery = await supabase
  //         .from('properties')
  //         .select('*')
  //         .ilike('title', `%${title}%`);

  //       if (titleQuery.error) throw titleQuery.error;
        
  //       // If no results by title, try location
  //       if (!titleQuery.data?.length) {
  //         const locationQuery = await supabase
  //           .from('properties')
  //           .select('*')
  //           .ilike('location', `%${location}%`);

  //         if (locationQuery.error) throw locationQuery.error;
  //         return locationQuery.data || [];
  //       }

  //       return titleQuery.data;
  //     }

  //     // Handle regular search queries
  //     const bedroomsMatch = query.match(/(\d+)\s*bhk/i);
  //     const priceMatch = query.match(/(\d+(?:\.\d+)?)\s*(crore|lakh|k|million)/i);
  //     const locationMatch = query.match(/in\s+([a-zA-Z\s,]+)/i);
      
  //     let baseQuery = supabase.from('properties').select('*');

  //     if (bedroomsMatch) {
  //       baseQuery = baseQuery.eq('bedrooms_min', parseInt(bedroomsMatch[1]));
  //     }

  //     if (locationMatch) {
  //       const location = locationMatch[1].trim();
  //       baseQuery = baseQuery.ilike('location', `%${location}%`);
  //     }

  //     if (priceMatch) {
  //       let price = parseFloat(priceMatch[1]);
  //       const unit = priceMatch[2].toLowerCase();
        
  //       switch (unit) {
  //         case 'crore':
  //           price *= 10000000;
  //           break;
  //         case 'lakh':
  //           price *= 100000;
  //           break;
  //         case 'k':
  //           price *= 1000;
  //           break;
  //         case 'million':
  //           price *= 1000000;
  //           break;
  //       }
        
  //       baseQuery = baseQuery.lte('price_min', price);
  //     }

  //     const { data, error } = await baseQuery.order('created_at', { ascending: false });
  //     if (error) throw error;
  //     return data || [];

  //   } catch (error) {
  //     console.error('Error searching properties:', error);
  //     throw error;
  //   }
  // }


  // async searchProperties(query: string): Promise<Property[]> {
  //   try {
  //     const bedroomsMatch = query.match(/(\d+)\s*bhk/i);
  //     const priceMatch = query.match(/(\d+(?:\.\d+)?)\s*(crore|lakh|k|million)/i);
  //     const locationMatch = query.match(/in\s+([a-zA-Z\s,]+)/i);
  
  //     // Match common features
  //     const featureKeywords = ['gym', 'parking', 'pool', 'lift', 'garden', 'playground'];
  //     const matchedFeatures = featureKeywords.filter(f => query.toLowerCase().includes(f));
  
  //     let baseQuery = supabase.from('properties').select('*');
  
  //     if (bedroomsMatch) {
  //       baseQuery = baseQuery.eq('bedrooms_min', parseInt(bedroomsMatch[1]));
  //     }
  
  //     if (locationMatch) {
  //       const location = locationMatch[1].trim();
  //       baseQuery = baseQuery.ilike('location', `%${location}%`);
  //     }
  
  //     if (priceMatch) {
  //       let price = parseFloat(priceMatch[1]);
  //       const unit = priceMatch[2].toLowerCase();
  //       switch (unit) {
  //         case 'crore': price *= 10000000; break;
  //         case 'lakh': price *= 100000; break;
  //         case 'k': price *= 1000; break;
  //         case 'million': price *= 1000000; break;
  //       }
  //       baseQuery = baseQuery.lte('price_min', price);
  //     }
  
  //     // ✅ New: Feature-based filtering using overlaps
  //     if (matchedFeatures.length > 0) {
  //       baseQuery = baseQuery.overlaps('features', matchedFeatures);
  //     }
  
  //     const { data, error } = await baseQuery.order('created_at', { ascending: false });
  //     if (error) throw error;
  //     return data || [];
  //   } catch (error) {
  //     console.error('Error searching properties:', error);
  //     throw error;
  //   }
  // }

  async searchProperties(
    query: string,
    limit?: number,
    offset?: number
  ): Promise<Property[]> {
    try {
      const bedroomsMatch = query.match(/(\d+)\s*bhk/i);
      const priceMatch = query.match(/(\d+(?:\.\d+)?)\s*(crore|lakh|k|million)/i);
  
      // Match common features (case-insensitive)
      const featureKeywords = ['gym', 'parking', 'pool', 'lift', 'garden', 'playground'];
      const matchedFeatures = featureKeywords.filter((f) => query.toLowerCase().includes(f));
  
      // Start building the query
      let baseQuery = supabase.from('properties').select('*');
  
      // Full-text search using .textSearch
      if (query.trim()) {
        baseQuery = baseQuery.textSearch('search_vector', query, {
          config: 'english', // Use the English text search configuration
          type: 'websearch', // Use websearch syntax for better parsing of natural language queries
        });
      }
  
      // Bedrooms filter
      if (bedroomsMatch) {
        baseQuery = baseQuery.eq('bedrooms_min', parseInt(bedroomsMatch[1]));
      }
  
      // Price filter
      if (priceMatch) {
        let price = parseFloat(priceMatch[1]);
        const unit = priceMatch[2].toLowerCase();
  
        switch (unit) {
          case 'crore':
            price *= 10000000;
            break;
          case 'lakh':
            price *= 100000;
            break;
          case 'k':
            price *= 1000;
            break;
          case 'million':
            price *= 1000000;
            break;
        }
  
        baseQuery = baseQuery.lte('price_min', price);
      }
  
      // Feature-based filtering using overlaps
      if (matchedFeatures.length > 0) {
        baseQuery = baseQuery.overlaps('features', matchedFeatures);
      }
  
      // Pagination support
      if (limit) {
        baseQuery = baseQuery.limit(limit);
      }
      if (offset) {
        baseQuery = baseQuery.range(offset, offset + (limit || 10) - 1);
      }
  
      // Order results by creation date
      baseQuery = baseQuery.order('created_at', { ascending: false });
  
      // Execute the query
      const { data, error } = await baseQuery;
  
      if (error) {
        console.error('Error searching properties:', error.message);
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }
  
      return data || [];
    } catch (error) {
      console.error('Error in searchProperties:', error);
      throw error;
    }
  },

  async searchLocationProperties(
    query: string,
    limit?: number,
    offset?: number
  ): Promise<Property[]> {
    try {
      const bedroomsMatch = query.match(/(\d+)\s*bhk/i);
      const priceMatch = query.match(/(\d+(?:\.\d+)?)\s*(crore|lakh|k|million)/i);
  
      // Match common features (case-insensitive)
      const featureKeywords = ['gym', 'parking', 'pool', 'lift', 'garden', 'playground'];
      const matchedFeatures = featureKeywords.filter((f) => query.toLowerCase().includes(f));
  
      // Start building the query
      let baseQuery = supabase.from('properties').select('*');
  
      // Full-text search using .textSearch
      if (query.trim()) {
        baseQuery = baseQuery.textSearch('search_vector', query, {
          config: 'english', // Use the English text search configuration
          type: 'websearch', // Use websearch syntax for better parsing of natural language queries
        });
      }
  
      // Bedrooms filter
      if (bedroomsMatch) {
        baseQuery = baseQuery.eq('bedrooms_min', parseInt(bedroomsMatch[1]));
      }
  
      // Price filter
      if (priceMatch) {
        let price = parseFloat(priceMatch[1]);
        const unit = priceMatch[2].toLowerCase();
  
        switch (unit) {
          case 'crore':
            price *= 10000000;
            break;
          case 'lakh':
            price *= 100000;
            break;
          case 'k':
            price *= 1000;
            break;
          case 'million':
            price *= 1000000;
            break;
        }
  
        baseQuery = baseQuery.lte('price_min', price);
      }
  
      // Feature-based filtering using overlaps
      if (matchedFeatures.length > 0) {
        baseQuery = baseQuery.overlaps('features', matchedFeatures);
      }
  
      // Pagination support
      if (limit) {
        baseQuery = baseQuery.limit(limit);
      }
      if (offset) {
        baseQuery = baseQuery.range(offset, offset + (limit || 10) - 1);
      }
  
      // Order results by creation date
      baseQuery = baseQuery.order('created_at', { ascending: false });
  
      // Execute the query
      const { data, error } = await baseQuery;
  
      if (error) {
        console.error('Error searching properties:', error.message);
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }
  
      return data.slice(0, 10) || [];
    } catch (error) {
      console.error('Error in searchProperties:', error);
      throw error;
    }
  }
  
};