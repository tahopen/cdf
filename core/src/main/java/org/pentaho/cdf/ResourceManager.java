/*!
 * Copyright 2002 - 2017 Webdetails, a Hitachi Vantara company. All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

package org.pentaho.cdf;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;

import org.pentaho.cdf.environment.CdfEngine;

import pt.webdetails.cpf.repository.api.IReadAccess;
import pt.webdetails.cpf.resources.IResourceLoader;

public class ResourceManager {

  public static ResourceManager instance;

  private static final HashSet<String> CACHEABLE_EXTENSIONS = new HashSet<String>();
  private static final HashMap<String, String> cacheContainer = new HashMap<String, String>();

  private boolean isCacheEnabled = true;

  public ResourceManager() {

    CACHEABLE_EXTENSIONS.add( "html" );
    CACHEABLE_EXTENSIONS.add( "json" );
    CACHEABLE_EXTENSIONS.add( "cdfde" );

    final IResourceLoader resLoader = CdfEngine.getEnvironment().getResourceLoader();
    this.isCacheEnabled =
        Boolean.parseBoolean( resLoader.getPluginSetting( this.getClass(), "pentaho-cdf-dd/enable-cache" ) );
  }

  public static ResourceManager getInstance() {

    if ( instance == null ) {
      instance = new ResourceManager();
    }

    return instance;
  }

  public String getResourceAsString( final String path, final HashMap<String, String> tokens ) throws IOException {

    final String extension = getResourceExtension( path );

    final String cacheKey = buildCacheKey( path, tokens );

    // If it's cachable and we have it, return it.
    if ( isCacheEnabled && CACHEABLE_EXTENSIONS.contains( extension ) && cacheContainer.containsKey( cacheKey ) ) {

      // return from cache. Make sure we return a clone of the original object
      return cacheContainer.get( cacheKey );

    }

    IReadAccess systemAccess = CdfEngine.getPluginSystemReader( null );

    // Read file
    final InputStream in = systemAccess.getFileInputStream( path );
    final StringBuilder resource = new StringBuilder();
    int c;
    while ( ( c = in.read() ) != -1 ) {
      resource.append( (char) c );
    }
    in.close();

    // Make replacement of tokens
    if ( tokens != null ) {

      for ( final String key : tokens.keySet() ) {
        final int index = resource.indexOf( key );
        if ( index != -1 ) {
          resource.replace( index, index + key.length(), tokens.get( key ) );
        }
      }

    }

    final String output = resource.toString();

    // We have the resource. Should we cache it?
    if ( isCacheEnabled && CACHEABLE_EXTENSIONS.contains( extension ) ) {
      cacheContainer.put( cacheKey, output );
    }

    return output;

  }

  public String getResourceAsString( final String path ) throws IOException {

    return getResourceAsString( path, null );

  }

  private String buildCacheKey( final String path, final HashMap<String, String> tokens ) {

    final StringBuilder keyBuilder = new StringBuilder( path );

    if ( tokens != null ) {
      for ( final String key : tokens.keySet() ) {
        keyBuilder.append( key.hashCode() );
        keyBuilder.append( tokens.get( key ).hashCode() );
      }
    }

    return keyBuilder.toString();
  }

  private String getResourceExtension( final String path ) {

    return path.substring( path.lastIndexOf( '.' ) + 1 );

  }

  public void cleanCache() {
    cacheContainer.clear();
  }
}
