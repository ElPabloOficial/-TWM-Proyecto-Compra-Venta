using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class despacho
{
    public int id { get; set; }

    public string estado { get; set; } = null!;

    public string? datoslogisticos { get; set; }

    public int id_direccion { get; set; }

    public virtual ICollection<despachar2> despachar2s { get; set; } = new List<despachar2>();

    public virtual ICollection<generar2> generar2s { get; set; } = new List<generar2>();

    public virtual direccion id_direccionNavigation { get; set; } = null!;
}
