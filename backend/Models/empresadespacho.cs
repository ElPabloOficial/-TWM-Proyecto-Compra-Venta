using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class empresadespacho
{
    public int id { get; set; }

    public string nombre { get; set; } = null!;

    public string estandaresvolumetricos { get; set; } = null!;

    public virtual ICollection<despachar2> despachar2s { get; set; } = new List<despachar2>();
}
